import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Evidence from 'App/Models/Evidence'
import CreateEvidenceValidator from 'App/Validators/Evidences/CreateEvidenceValidator'
import UpdateEvidenceValidator from 'App/Validators/Evidences/UpdateEvidenceValidator'

export default class EvidencesController {
  // Obtener todas las evidencias
  public async index({ response }: HttpContextContract) {
    try {
      const evidences = await Evidence.query().preload('report')
      return response.status(200).json({
        data: evidences,
        msg: 'Evidencias obtenidas exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(500).json({
        data: null,
        msg: e.message || 'Error al obtener evidencias',
        status: 'failed',
      })
    }
  }

  // Crear una nueva evidencia
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateEvidenceValidator)
      const evidence = await Evidence.create(data)
      return response.status(201).json({
        data: evidence,
        msg: 'Evidencia creada exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al crear evidencia',
        status: 'failed',
      })
    }
  }

  // Mostrar una evidencia específica
  public async show({ params, response }: HttpContextContract) {
    try {
      const evidence = await Evidence.query().where('id', params.id).preload('report').firstOrFail()
      return response.status(200).json({
        data: evidence,
        msg: 'Evidencia obtenida exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Evidencia no encontrada',
        status: 'failed',
      })
    }
  }

  // Actualizar una evidencia
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateEvidenceValidator)
      const evidence = await Evidence.findOrFail(params.id)
      evidence.merge(data)
      await evidence.save()
      return response.status(200).json({
        data: evidence,
        msg: 'Evidencia actualizada exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al actualizar evidencia',
        status: 'failed',
      })
    }
  }

  // Eliminar una evidencia
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const evidence = await Evidence.findOrFail(params.id)
      await evidence.delete()
      return response.status(200).json({
        data: null,
        msg: 'Evidencia eliminada exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Evidencia no encontrada',
        status: 'failed',
      })
    }
  }
}
