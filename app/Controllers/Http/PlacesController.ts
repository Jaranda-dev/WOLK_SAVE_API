import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Place from 'App/Models/Place'
import CreatePlaceValidator from 'App/Validators/Places/CreatePlaceValidator'
import UpdatePlaceValidator from 'App/Validators/Places/UpdatePlaceValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'

export default class PlacesController {
  // Obtener todos los lugares
  public async index({ response }: HttpContextContract) {
    try {
      const places = await Place.query()
        .preload('incidents')
        .preload('startRoutes')
        .preload('endRoutes')

      return jsonResponse(response, 200, places, 'Lugares obtenidos exitosamente')
    } catch (e) {
      return jsonResponse(response, 500, null, e.message || 'Error al obtener lugares', false)
    }
  }

  // Crear un nuevo lugar
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreatePlaceValidator)
      const place = await Place.create(data)

      return jsonResponse(response, 201, place, 'Lugar creado exitosamente')
    } catch (e) {
      const msg = e.messages || e.message || 'Error al crear lugar'
      return jsonResponse(response, 400, null, msg, false)
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

      return jsonResponse(response, 200, place, 'Lugar obtenido exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Lugar no encontrado', false)
    }
  }

  // Actualizar un lugar
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdatePlaceValidator)
      const place = await Place.findOrFail(params.id)
      place.merge(data)
      await place.save()

      return jsonResponse(response, 200, place, 'Lugar actualizado exitosamente')
    } catch (e) {
      const msg = e.messages || e.message || 'Error al actualizar lugar'
      return jsonResponse(response, 400, null, msg, false)
    }
  }

  // Eliminar un lugar
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const place = await Place.findOrFail(params.id)
      await place.delete()

      return jsonResponse(response, 200, null, 'Lugar eliminado exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Lugar no encontrado', false)
    }
  }
}
