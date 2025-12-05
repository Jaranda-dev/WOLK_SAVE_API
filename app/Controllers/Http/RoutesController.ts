import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from 'App/Models/Route'
import CreateRouteValidator from 'App/Validators/Routes/CreateRouteValidator'
import UpdateRouteValidator from 'App/Validators/Routes/UpdateRouteValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'
import { getUser, isAdminOrMonitor } from 'App/Helpers/AuthHelper'
import Place from 'App/Models/Place'

export default class RoutesController {
  // Consulta base con preloads
  private baseQuery() {
    return Route.query()
      .preload('user')
      .preload('startPlace')
      .preload('endPlace')
      .preload('runs')
  }

  // Obtener todas las rutas
  public async index({ response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)  // <-- usar helper externo
      const query = this.baseQuery()
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id) // <-- helper externo

      const routes = await query
      return jsonResponse(response, 200, routes, 'Rutas obtenidas exitosamente')
    } catch (e: any) {
      const status = e.name === 'AuthenticationException' ? 401 : 500
      return jsonResponse(response, status, null, e.message || 'Error al obtener rutas', false)
    }
  }

  // Crear una nueva ruta
  public async store({ request, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const data = await request.validate(CreateRouteValidator)

      if (!isAdminOrMonitor(user)) data.userId = user.id

      const placeStart = await Place.create({
        name:data.origin,
        lat:data.originLatLng.lat,
        long:data.originLatLng.lng,
        type:"routepoints"
      })

      const placeEnd = await Place.create({
        name:data.destination,
        lat:data.destinationLatLng.lat,
        long:data.destinationLatLng.lng,
        type:"routepoints"
      })
 
      const route = await Route.create({
        userId:data.userId,
        name:data.name,
        endPlaceId:placeEnd.id,
        startPlaceId:placeStart.id,
      })
      return jsonResponse(response, 201, route, 'Ruta creada exitosamente')
    } catch (e: any) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al crear ruta', false)
    }
  }

  // Mostrar una ruta específica
  public async show({ params, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const query = this.baseQuery().where('id', params.id)
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const route = await query.firstOrFail()
      return jsonResponse(response, 200, route, 'Ruta obtenida exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Ruta no encontrada', false)
    }
  }

  // Actualizar una ruta
  public async update({ params, request, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const data = await request.validate(UpdateRouteValidator)

      const query = Route.query().where('id', params.id)
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const route = await query.firstOrFail()
      route.merge(data)
      await route.save()

      return jsonResponse(response, 200, route, 'Ruta actualizada exitosamente')
    } catch (e: any) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al actualizar ruta', false)
    }
  }

  // Eliminar una ruta
  public async destroy({ params, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const query = Route.query().where('id', params.id)
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const route = await query.firstOrFail()
      await route.delete()

      return jsonResponse(response, 200, null, 'Ruta eliminada exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Ruta no encontrada', false)
    }
  }
}
