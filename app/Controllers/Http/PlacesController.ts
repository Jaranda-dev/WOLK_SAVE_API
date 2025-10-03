import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Place from 'App/Models/Place'
import CreatePlaceValidator from 'App/Validators/Places/CreatePlaceValidator'
import UpdatePlaceValidator from 'App/Validators/Places/UpdatePlaceValidator'

export default class PlacesController {
  // Obtener todos los lugares
  public async index({ response }: HttpContextContract) {
    try {
      const places = await Place.query()
        .preload('incidents')
        .preload('startRoutes')
        .preload('endRoutes')
      return response.status(200).json({
        data: places,
        msg: 'Lugares obtenidos exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(500).json({
        data: null,
        msg: e.message || 'Error al obtener lugares',
        status: 'failed',
      })
    }
  }

  // Crear un nuevo lugar
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreatePlaceValidator)
      const place = await Place.create(data)
      return response.status(201).json({
        data: place,
        msg: 'Lugar creado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al crear lugar',
        status: 'failed',
      })
    }
  }

  // Mostrar un lugar específico
  public async show({ params, response }: HttpContextContract) {
    try {
      const place = await Place.query()
        .where('id', params.id)
        .preload('incidents')
        .preload('startRoutes')
        .preload('endRoutes')
        .firstOrFail()
      return response.status(200).json({
        data: place,
        msg: 'Lugar obtenido exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Lugar no encontrado',
        status: 'failed',
      })
    }
  }

  // Actualizar un lugar
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdatePlaceValidator)
      const place = await Place.findOrFail(params.id)
      place.merge(data)
      await place.save()
      return response.status(200).json({
        data: place,
        msg: 'Lugar actualizado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al actualizar lugar',
        status: 'failed',
      })
    }
  }

  // Eliminar un lugar
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const place = await Place.findOrFail(params.id)
      await place.delete()
      return response.status(200).json({
        data: null,
        msg: 'Lugar eliminado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Lugar no encontrado',
        status: 'failed',
      })
    }
  }
}
