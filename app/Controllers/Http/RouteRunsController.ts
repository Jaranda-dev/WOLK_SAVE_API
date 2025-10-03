import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RouteRun from 'App/Models/RouteRun'
import CreateRouteRunValidator from 'App/Validators/RouteRuns/CreateRouteRunValidator'
import UpdateRouteRunValidator from 'App/Validators/RouteRuns/UpdateRouteRunValidator'

export default class RouteRunsController {
  // Obtener todos los RouteRuns
  public async index({ response }: HttpContextContract) {
    try {
      const runs = await RouteRun.query()
        .preload('route')
        .preload('user')
        .preload('incidents')
      return response.status(200).json({
        data: runs,
        msg: 'Recorridos obtenidos exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(500).json({
        data: null,
        msg: e.message || 'Error al obtener recorridos',
        status: 'failed',
      })
    }
  }

  // Crear un nuevo RouteRun
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateRouteRunValidator)
      const run = await RouteRun.create(data)
      return response.status(201).json({
        data: run,
        msg: 'Recorrido creado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al crear recorrido',
        status: 'failed',
      })
    }
  }

  // Mostrar un RouteRun específico
  public async show({ params, response }: HttpContextContract) {
    try {
      const run = await RouteRun.query()
        .where('id', params.id)
        .preload('route')
        .preload('user')
        .preload('incidents')
        .firstOrFail()
      return response.status(200).json({
        data: run,
        msg: 'Recorrido obtenido exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Recorrido no encontrado',
        status: 'failed',
      })
    }
  }

  // Actualizar un RouteRun
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateRouteRunValidator)
      const run = await RouteRun.findOrFail(params.id)
      run.merge(data)
      await run.save()
      return response.status(200).json({
        data: run,
        msg: 'Recorrido actualizado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al actualizar recorrido',
        status: 'failed',
      })
    }
  }

  // Eliminar un RouteRun
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const run = await RouteRun.findOrFail(params.id)
      await run.delete()
      return response.status(200).json({
        data: null,
        msg: 'Recorrido eliminado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Recorrido no encontrado',
        status: 'failed',
      })
    }
  }
}
