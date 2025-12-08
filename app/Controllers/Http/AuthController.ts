import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import RegisterValidator from 'App/Validators/Auth/RegisterValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'
import FirebaseService from 'App/Services/FirebaseService'

export default class AuthController {

  // Registro
  public async register({ request, response, auth }: HttpContextContract) {
    try {
      const data = await request.validate(RegisterValidator)

      const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        roleId: 3,
      })

      const token = await auth.use('api').login(user, { expiresIn: '7days' })

      return jsonResponse(response, 201, { user, token }, 'Usuario registrado correctamente')
    } catch (e) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al registrar el usuario', false)
    }
  }

  // Login
  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const { email, password } = await request.validate(LoginValidator)

      const token = await auth.use('api').attempt(email, password, { expiresIn: '7days' })
      const user = auth.use('api').user!

      return jsonResponse(response, 200, { user, token }, 'Login exitoso')
    } catch (e) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, 'Credenciales inválidas', false)
    }
  }

  // Logout
  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').logout()
    return jsonResponse(response, 200, null, 'Sesión cerrada correctamente')
  }

  // Guardar FCM token
  public async saveFcmToken({ request, response, auth }: HttpContextContract) {
    try {
      const user = auth.use('api').user!
      const { fcmToken } = request.only(['fcmToken'])

      if (!fcmToken) {
        return jsonResponse(response, 400, null, 'Token FCM requerido', false)
      }

      // Guardar token en la BD
      user.tokenFirebase = fcmToken
      await user.save()

      console.log(`[Firebase] Token guardado para usuario ${user.id}: ${fcmToken}`)

      return jsonResponse(response, 200, { user }, 'Token FCM guardado correctamente')
    } catch (e) {
      console.error('[Firebase] Error guardando token:', e.message)
      return jsonResponse(response, 400, null, e.message || 'Error al guardar token', false)
    }
  }

  // Obtener token FCM del usuario
  public async getFcmToken({ request, response, auth }: HttpContextContract) {
    try {
      const user = auth.use('api').user!
      
      return jsonResponse(response, 200, { token: user.tokenFirebase }, 'Token obtenido')
    } catch (e) {
      return jsonResponse(response, 400, null, e.message, false)
    }
  }

  // Enviar notificación de prueba
  public async sendTestNotification({ response, auth }: HttpContextContract) {
    try {
      const user = auth.use('api').user!
      console.log(user)
      if (!user.tokenFirebase) {
        return jsonResponse(response, 400, null, 'Usuario sin token FCM', false)
      }
      

      const result = await FirebaseService.sendNotification(
        user.tokenFirebase,
        'Notificación de Prueba',
        'Esta es una notificación de prueba desde el backend'
      )

      console.log('[Firebase] Notificación de prueba enviada:', result)

      return jsonResponse(response, 200, { notificationId: result }, 'Notificación enviada')
    } catch (e) {
      console.error('[Firebase] Error enviando notificación de prueba:', e.message)
      return jsonResponse(response, 400, null, e.message, false)
    }
  }
}
