import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from 'App/Models/Route'
import CreateRouteValidator from 'App/Validators/Routes/CreateRouteValidator'
import UpdateRouteValidator from 'App/Validators/Routes/UpdateRouteValidator'

export default class RoutesController {
  // Obtener todos los routes
  public async index({ response }: HttpContextContract) {
    try {
      const routes = await Route.query()
        .preload('user')
        .preload('startPlace')
        .preload('endPlace')
        .preload('runs')
      return response.status(200).json({
        data: routes,
        msg: 'Rutas obtenidas exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(500).json({
        data: null,
        msg: e.message || 'Error al obtener rutas',
        status: 'failed',
      })
    }
  }

  // Crear una nueva route
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateRouteValidator)
      const route = await Route.create(data)
      return response.status(201).json({
        data: route,
        msg: 'Ruta creada exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al crear ruta',
        status: 'failed',
      })
    }
  }

  // Mostrar una route específica
  public async show({ params, response }: HttpContextContract) {
    try {
      const route = await Route.query()
        .where('id', params.id)
        .preload('user')
        .preload('startPlace')
        .preload('endPlace')
        .preload('runs')
        .firstOrFail()
      return response.status(200).json({
        data: route,
        msg: 'Ruta obtenida exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Ruta no encontrada',
        status: 'failed',
      })
    }
  }

  // Actualizar una route
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateRouteValidator)
      const route = await Route.findOrFail(params.id)
      route.merge(data)
      await route.save()
      return response.status(200).json({
        data: route,
        msg: 'Ruta actualizada exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al actualizar ruta',
        status: 'failed',
      })
    }
  }

  // Eliminar una route
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const route = await Route.findOrFail(params.id)
      await route.delete()
      return response.status(200).json({
        data: null,
        msg: 'Ruta eliminada exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Ruta no encontrada',
        status: 'failed',
      })
    }
  }
}
