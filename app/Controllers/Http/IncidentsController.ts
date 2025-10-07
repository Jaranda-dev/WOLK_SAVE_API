import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Incident from 'App/Models/Incident'
import CreateIncidentValidator from 'App/Validators/Incidents/CreateIncidentValidator'
import UpdateIncidentValidator from 'App/Validators/Incidents/UpdateIncidentValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'

export default class IncidentsController {
  // Obtener todos los incidentes
  public async index({ response }: HttpContextContract) {
    try {
      const incidents = await Incident.query()
        .preload('place')
        .preload('routeRun')
        .preload('reports')

      return jsonResponse(response, 200, incidents, 'Incidentes obtenidos exitosamente')
    } catch (e) {
      return jsonResponse(response, 500, null, e.message || 'Error al obtener incidentes', false)
    }
  }

  // Crear un nuevo incidente
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateIncidentValidator)
      const incident = await Incident.create(data)
      return jsonResponse(response, 201, incident, 'Incidente creado exitosamente')
    } catch (e) {
      if (e.messages) {
        return jsonResponse(response, 422, null, e.messages, false)
      }

      return jsonResponse(response, 400, null, e.message || 'Error al crear incidente', false)
    }
  }

  // Mostrar un incidente específico
  public async show({ params, response }: HttpContextContract) {
    try {
      const incident = await Incident.query()
        .where('id', params.id)
        .preload('place')
        .preload('routeRun')
        .preload('reports')
        .firstOrFail()

      return jsonResponse(response, 200, incident, 'Incidente obtenido exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Incidente no encontrado', false)
    }
  }

  // Actualizar un incidente existente
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateIncidentValidator)
      const incident = await Incident.findOrFail(params.id)
      incident.merge(data)
      await incident.save()

      return jsonResponse(response, 200, incident, 'Incidente actualizado exitosamente')
    } catch (e) {
      if (e.messages) {
        return jsonResponse(response, 422, null, e.messages, false)
      }

      return jsonResponse(response, 400, null, e.message || 'Error al actualizar incidente', false)
    }
  }

  // Eliminar un incidente
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const incident = await Incident.findOrFail(params.id)
      await incident.delete()

      return jsonResponse(response, 200, null, 'Incidente eliminado exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Incidente no encontrado', false)
    }
  }
}
