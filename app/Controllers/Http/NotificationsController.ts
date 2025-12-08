import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import FirebaseService from 'App/Services/FirebaseService'
import { jsonResponse } from 'App/Helpers/ResponseHelper'

export default class NotificationController {


  
  /**
   * Enviar notificación de prueba al usuario autenticado
   * POST /api/v1/notifications/test
   */
  public async sendTestNotification({ response, auth }: HttpContextContract) {
    try {
      const user = auth.use('api').user!
        console.log(user)
      if (!user.tokenFirebase) {
        console.log(user)
        return jsonResponse(
          response,
          400,
          null,
          'Usuario sin token FCM registrado. Por favor, inicia sesión desde la app.',
          false
        )
      }

      const messageId = await FirebaseService.sendNotification(
        user.tokenFirebase,
        '🔔 Notificación de Prueba',
        '¡Hola! Esta es una notificación de prueba desde WolkSafe. Todo está funcionando correctamente.',
        {
          type: 'test',
          userId: user.id.toString(),
          timestamp: new Date().toISOString(),
        },
        'https://wolksafe.example.com/logo.png' // URL opcional de imagen
      )

      if (!messageId) {
        return jsonResponse(response, 500, null, 'No se pudo enviar la notificación', false)
      }

      console.log(`[Notifications] Notificación de prueba enviada a usuario ${user.id}`)

      return jsonResponse(
        response,
        200,
        { messageId, userId: user.id },
        'Notificación enviada exitosamente'
      )
    } catch (e) {
      console.error('[NotificationController] Error enviando notificación de prueba:', e)
      return jsonResponse(response, 500, null, e.message || 'Error enviando notificación', false)
    }
  }

  /**
   * Enviar notificación a un usuario específico (requiere admin)
   * POST /api/v1/notifications/send
   * Body: { userId: number, title: string, body: string, data?: object }
   */
  public async sendToUser({ request, response }: HttpContextContract) {
    try {
      const { userId, title, body, data } = request.all()

      if (!userId || !title || !body) {
        return jsonResponse(
          response,
          400,
          null,
          'userId, title y body son requeridos',
          false
        )
      }

      const user = await User.findOrFail(userId)

      if (!user.tokenFirebase) {
        return jsonResponse(
          response,
          400,
          null,
          `Usuario ${userId} sin token FCM registrado`,
          false
        )
      }

      const messageId = await FirebaseService.sendNotification(
        user.tokenFirebase,
        title,
        body,
        data || {}
      )

      if (!messageId) {
        return jsonResponse(response, 500, null, 'Error enviando notificación', false)
      }

      console.log(`[Notifications] Notificación enviada a usuario ${userId}`)

      return jsonResponse(
        response,
        200,
        { messageId, userId },
        'Notificación enviada'
      )
    } catch (e) {
      console.error('[NotificationController] Error enviando notificación:', e)
      return jsonResponse(response, 500, null, e.message || 'Error enviando notificación', false)
    }
  }

  /**
   * Enviar notificación a múltiples usuarios (requiere admin)
   * POST /api/v1/notifications/send-multiple
   * Body: { userIds: number[], title: string, body: string, data?: object }
   */
  public async sendToMultiple({ request, response }: HttpContextContract) {
    try {
      const { userIds, title, body, data } = request.all()

      if (!Array.isArray(userIds) || !title || !body) {
        return jsonResponse(
          response,
          400,
          null,
          'userIds (array), title y body son requeridos',
          false
        )
      }

      // Obtener usuarios y sus tokens
      const users = await User.query().whereIn('id', userIds)
      const tokens = users.filter((u) => u.tokenFirebase).map((u) => u.tokenFirebase!)

      if (tokens.length === 0) {
        return jsonResponse(
          response,
          400,
          null,
          'Ninguno de los usuarios tiene token FCM registrado',
          false
        )
      }

      const result = await FirebaseService.sendNotificationToMultiple(
        tokens,
        title,
        body,
        data || {}
      )

      if (!result) {
        return jsonResponse(response, 500, null, 'Error enviando notificaciones', false)
      }

      console.log(
        `[Notifications] ${result.successCount} notificaciones enviadas, ${result.failureCount} fallidas`
      )

      return jsonResponse(
        response,
        200,
        {
          successCount: result.successCount,
          failureCount: result.failureCount,
          totalSent: userIds.length,
        },
        'Notificaciones enviadas'
      )
    } catch (e) {
      console.error('[NotificationController] Error enviando notificaciones múltiples:', e)
      return jsonResponse(
        response,
        500,
        null,
        e.message || 'Error enviando notificaciones',
        false
      )
    }
  }

  /**
   * Suscribir usuario a un topic de notificaciones
   * POST /api/v1/notifications/subscribe/:topic
   */
  public async subscribeTopic({ params, response, auth }: HttpContextContract) {
    try {
      const user = auth.use('api').user!
      const { topic } = params

      if (!topic) {
        return jsonResponse(response, 400, null, 'Topic requerido', false)
      }

      if (!user.tokenFirebase) {
        return jsonResponse(
          response,
          400,
          null,
          'Usuario sin token FCM registrado',
          false
        )
      }

      // Validar nombre del topic (solo letras, números, guiones, guiones bajos)
      if (!/^[a-zA-Z0-9_-]+$/.test(topic)) {
        return jsonResponse(
          response,
          400,
          null,
          'Nombre de topic inválido. Solo se permiten letras, números, guiones y guiones bajos.',
          false
        )
      }

      await FirebaseService.subscribeToTopic([user.tokenFirebase], topic)

      console.log(`[Notifications] Usuario ${user.id} suscrito al topic '${topic}'`)

      return jsonResponse(
        response,
        200,
        { userId: user.id, topic },
        `Suscrito al topic '${topic}'`
      )
    } catch (e) {
      console.error('[NotificationController] Error suscribiendo a topic:', e)
      return jsonResponse(response, 500, null, e.message || 'Error suscribiendo', false)
    }
  }

  /**
   * Desuscribir usuario de un topic
   * DELETE /api/v1/notifications/unsubscribe/:topic
   */
  public async unsubscribeTopic({ params, response, auth }: HttpContextContract) {
    try {
      const user = auth.use('api').user!
      const { topic } = params

      if (!topic) {
        return jsonResponse(response, 400, null, 'Topic requerido', false)
      }

      if (!user.tokenFirebase) {
        return jsonResponse(
          response,
          400,
          null,
          'Usuario sin token FCM registrado',
          false
        )
      }

      await FirebaseService.unsubscribeFromTopic([user.tokenFirebase], topic)

      console.log(`[Notifications] Usuario ${user.id} desuscrito del topic '${topic}'`)

      return jsonResponse(
        response,
        200,
        { userId: user.id, topic },
        `Desuscrito del topic '${topic}'`
      )
    } catch (e) {
      console.error('[NotificationController] Error desuscribiendo de topic:', e)
      return jsonResponse(response, 500, null, e.message || 'Error desuscribiendo', false)
    }
  }
}

/**
 * CASOS DE USO RECOMENDADOS:
 *
 * 1. NOTIFICACIONES DE INCIDENTES
 *    - Suscribir usuarios a topics como: "incidents-{zoneId}", "incidents-{contactId}"
 *    - Cuando se reporte un incidente, enviar a users suscritos del topic
 *
 * 2. NOTIFICACIONES DE RUTAS
 *    - Suscribir usuarios a: "routes-{userId}"
 *    - Notificar cuando una ruta se completa, se cancela, o hay cambios
 *
 * 3. NOTIFICACIONES DE CONTACTOS
 *    - Suscribir usuarios a: "contacts-{contactId}"
 *    - Notificar sobre cambios en información de contactos de emergencia
 *
 * 4. ALERTAS DE EMERGENCIA
 *    - Topic: "emergency-alerts"
 *    - Suscribir todos los administradores/supervisores
 *    - Enviar cuando se reporte una emergencia
 *
 * EJEMPLO - Crear incident y notificar:
 *
 * import FirebaseService from 'App/Services/FirebaseService'
 * import User from 'App/Models/User'
 *
 * // En IncidentController.store():
 * const incident = await Incident.create({ ... })
 *
 * // Obtener supervisores/admins
 * const admins = await User.query().where('roleId', 1)
 * const tokens = admins.filter(u => u.tokenFirebase).map(u => u.tokenFirebase!)
 *
 * // Enviar notificación
 * await FirebaseService.sendNotificationToMultiple(
 *   tokens,
 *   'Nuevo Incidente Reportado',
 *   `Se reportó un nuevo incidente en zona ${incident.placeId}`,
 *   {
 *     type: 'incident',
 *     incidentId: incident.id.toString(),
 *     zoneId: incident.placeId.toString(),
 *   }
 * )
 *
 * // O usar topics:
 * await FirebaseService.sendNotificationToTopic(
 *   `incidents-${incident.placeId}`,
 *   'Nuevo Incidente',
 *   `Se reportó un incidente en tu zona`,
 *   { incidentId: incident.id.toString() }
 * )
 */
