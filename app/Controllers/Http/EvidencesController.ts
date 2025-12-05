import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Evidence from 'App/Models/Evidence'
import CreateEvidenceValidator from 'App/Validators/Evidences/CreateEvidenceValidator'
import UpdateEvidenceValidator from 'App/Validators/Evidences/UpdateEvidenceValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'

export default class EvidencesController {
  // Obtener todas las evidencias
  public async index({ response }: HttpContextContract) {
    try {
      const evidences = await Evidence.query().preload('incident')
      return jsonResponse(response, 200, evidences, 'Evidencias obtenidas exitosamente')
    } catch (e) {
      return jsonResponse(response, 500, null, e.message || 'Error al obtener evidencias', false)
    }
  }

  // Crear una nueva evidencia
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateEvidenceValidator)
      const evidence = await Evidence.create(data)
      return jsonResponse(response, 201, evidence, 'Evidencia creada exitosamente')
    } catch (e) {
      if (e.messages) {
        return jsonResponse(response, 422, null, e.messages, false)
      }

      return jsonResponse(response, 400, null, e.message || 'Error al crear evidencia', false)
    }
  }

  // Mostrar una evidencia específica
  public async show({ params, response }: HttpContextContract) {
    try {
      const evidence = await Evidence.query().where('id', params.id).preload('incident').firstOrFail()
      return jsonResponse(response, 200, evidence, 'Evidencia obtenida exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Evidencia no encontrada', false)
    }
  }

  // Actualizar una evidencia
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateEvidenceValidator)
      const evidence = await Evidence.findOrFail(params.id)
      evidence.merge(data)
      await evidence.save()
      return jsonResponse(response, 200, evidence, 'Evidencia actualizada exitosamente')
    } catch (e) {
      if (e.messages) {
        return jsonResponse(response, 422, null, e.messages, false)
      }

      return jsonResponse(response, 400, null, e.message || 'Error al actualizar evidencia', false)
    }
  }

  // Eliminar una evidencia
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const evidence = await Evidence.findOrFail(params.id)
      await evidence.delete()
      return jsonResponse(response, 200, null, 'Evidencia eliminada exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Evidencia no encontrada', false)
    }
  }
}
