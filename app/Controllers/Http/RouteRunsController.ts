import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RouteRun from 'App/Models/RouteRun'
import Ws from 'App/Services/Ws'
import CreateRouteRunValidator from 'App/Validators/RouteRuns/CreateRouteRunValidator'
import UpdateRouteRunValidator from 'App/Validators/RouteRuns/UpdateRouteRunValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'
import { getUser, isAdminOrMonitor } from 'App/Helpers/AuthHelper'
import { DateTime } from 'luxon'

export default class RouteRunsController {
  // Consulta base con preloads
  private baseQuery() {
    return RouteRun.query()
      .preload('route', (r) => r.preload('startPlace').preload('endPlace'))
      .preload('user')
      .preload('incidents')
  }

  // Obtener todos los recorridos
  public async index({ response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const query = this.baseQuery()

      // Si no es admin o monitoreador, filtrar solo sus recorridos
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const runs = await query
      return jsonResponse(response, 200, runs, 'Recorridos obtenidos exitosamente')
    } catch (e: any) {
      const status = e.name === 'AuthenticationException' ? 401 : 500
      return jsonResponse(response, status, null, e.message || 'Error al obtener recorridos', false)
    }
  }

  // Crear un nuevo recorrido
  public async store({ request, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const data = await request.validate(CreateRouteRunValidator)
      const date = DateTime.now()
      data.startTime = date
      // Si no es admin o monitoreador, asignar usuario
      if (!isAdminOrMonitor(user)) data.user_id = user.id

      const run = await RouteRun.create(data)
      // Emit event globally and to any admins/monitors listening to this user
      try {
        console.log('[Ws] emitting route-run-started', { runId: run.id, userId: run.userId })
        Ws.io.emit('route-run-started', { run })
        Ws.io.to(`listen:${run.userId}`).emit('route-run-started', { run })
      } catch (err) {
        console.log('[Ws] error emitting route-run-started', err)
        // ignore socket errors
      }
      return jsonResponse(response, 201, run, 'Recorrido creado exitosamente')
    } catch (e: any) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al crear recorrido', false)
    }
  }

  // Mostrar un recorrido específico
  public async show({ params, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const query = this.baseQuery().where('id', params.id)

      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const run = await query.firstOrFail()
      return jsonResponse(response, 200, run, 'Recorrido obtenido exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Recorrido no encontrado', false)
    }
  }

  // Actualizar un recorrido
  public async update({ params, request, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const data = await request.validate(UpdateRouteRunValidator)

      const query = RouteRun.query().where('id', params.id)
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const run = await query.firstOrFail()
      run.merge(data)
      await run.save()

      return jsonResponse(response, 200, run, 'Recorrido actualizado exitosamente')
    } catch (e: any) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al actualizar recorrido', false)
    }
  }

  // Eliminar un recorrido
  public async destroy({ params, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const query = RouteRun.query().where('id', params.id)
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const run = await query.firstOrFail()
      await run.delete()

      return jsonResponse(response, 200, null, 'Recorrido eliminado exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Recorrido no encontrado', false)
    }
  }

    // Actualizar un recorrido
  public async finishedRouterRun({ params, request, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)

      const query = this.baseQuery().where('id', params.id)
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)
      const date = DateTime.now()
      const run = await query.firstOrFail()
      run.endTime= date
      await run.save()
      // Notify via websocket that the run finished
      try {
        console.log('[Ws] emitting route-run-finished', { runId: run.id, userId: run.userId })
        Ws.io.emit('route-run-finished', { run })
        Ws.io.to(`listen:${run.userId}`).emit('route-run-finished', { run })
      } catch (err) {
        console.log('[Ws] error emitting route-run-finished', err)
      }

      return jsonResponse(response, 200, run, 'Recorrido actualizado exitosamente')
    } catch (e: any) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al actualizar recorrido', false)
    }
  }

}
