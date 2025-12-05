import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Evidence from 'App/Models/Evidence'
import CreateEvidenceValidator from 'App/Validators/Evidences/CreateEvidenceValidator'
import UpdateEvidenceValidator from 'App/Validators/Evidences/UpdateEvidenceValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'
import Drive from '@ioc:Adonis/Core/Drive'
import { basename } from 'path'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs'

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

  public async getEvidence({ params, response }: HttpContextContract) {
    try {
      const evidence = await Evidence.findOrFail(params.id)
      console.log('public/'+evidence.path)
      // evidence.path should be the stored path relative to drive root
      // Primero intentar con Drive (ruta relativa al disco)
      let exists = await Drive.exists(evidence.path)
      console.log('[Evidence] checking Drive.exists for', evidence.path, '=>', exists)
      const filename = evidence.fileName || basename(evidence.path)
      const contentType = evidence.fileType || 'application/octet-stream'

      if (exists) {
        response.header('Content-Type', contentType)
        response.header('Content-Disposition', `attachment; filename="${filename}"`)
        const stream = await Drive.getStream(evidence.path)
        return response.stream(stream)
      }

      // Fallbacks: checar varias ubicaciones bajo public/ donde puedan estar los archivos
      const candidates = [] as string[]
      // If path already includes uploads prefix, this will point to public/uploads/...
      candidates.push(Application.publicPath(evidence.path))
      // If path is stored as relative 'incidents/..', check public/uploads/incidents/...
      candidates.push(Application.publicPath(`uploads/${evidence.path}`))
      // Also check public/<path-without-leading-uploads> just in case
      candidates.push(Application.publicPath(evidence.path.replace(/^uploads\//, '')))

      console.log('[Evidence] fallback candidates:', candidates)
      for (const p of candidates) {
        try {
          console.log('[Evidence] checking fs.existsSync for', p)
          if (fs.existsSync(p)) {
            response.header('Content-Type', contentType)
            response.header('Content-Disposition', `attachment; filename="${filename}"`)
            return response.download(p)
          }
        } catch (err) {
          // ignore and continue
        }
      }

      return jsonResponse(response, 404, null, 'Archivo no encontrado en el almacenamiento', false)
    } catch {
      return jsonResponse(response, 404, null, 'Evidencia no encontrada', false)
    }
  }
}
