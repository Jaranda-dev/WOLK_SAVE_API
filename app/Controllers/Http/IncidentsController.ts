import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Incident from 'App/Models/Incident'
import CreateIncidentValidator from 'App/Validators/Incidents/CreateIncidentValidator'
import UpdateIncidentValidator from 'App/Validators/Incidents/UpdateIncidentValidator'

export default class IncidentsController {
  // Obtener todos los incidentes
  public async index({ response }: HttpContextContract) {
    try {
      const incidents = await Incident.query()
        .preload('place')
        .preload('routeRun')
        .preload('reports')
      return response.status(200).json({
        data: incidents,
        msg: 'Incidentes obtenidos exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(500).json({
        data: null,
        msg: e.message || 'Error al obtener incidentes',
        status: 'failed',
      })
    }
  }

  // Crear un nuevo incidente
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateIncidentValidator)
      const incident = await Incident.create(data)
      return response.status(201).json({
        data: incident,
        msg: 'Incidente creado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al crear incidente',
        status: 'failed',
      })
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
      return response.status(200).json({
        data: incident,
        msg: 'Incidente obtenido exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Incidente no encontrado',
        status: 'failed',
      })
    }
  }

  // Actualizar un incidente existente
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateIncidentValidator)
      const incident = await Incident.findOrFail(params.id)
      incident.merge(data)
      await incident.save()
      return response.status(200).json({
        data: incident,
        msg: 'Incidente actualizado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al actualizar incidente',
        status: 'failed',
      })
    }
  }

  // Eliminar un incidente
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const incident = await Incident.findOrFail(params.id)
      await incident.delete()
      return response.status(200).json({
        data: null,
        msg: 'Incidente eliminado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Incidente no encontrado',
        status: 'failed',
      })
    }
  }
}
