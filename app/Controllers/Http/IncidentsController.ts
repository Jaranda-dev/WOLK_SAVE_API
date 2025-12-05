import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Incident from 'App/Models/Incident'
import CreateIncidentValidator from 'App/Validators/Incidents/CreateIncidentValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'
import Evidence from "App/Models/Evidence"
import { cuid } from "@ioc:Adonis/Core/Helpers"
import Application from '@ioc:Adonis/Core/Application'
import Drive from '@ioc:Adonis/Core/Drive'
import Place from 'App/Models/Place'

export default class IncidentsController {// Crear un nuevo incidente con archivos
  public async store({ request, response }: HttpContextContract) {
    try {
      // Validar datos
      const data = await request.validate(CreateIncidentValidator)

      const place = await Place.create(
        {
          lat:data.lat,
          long:data.lng,
          name:'incident',
          type:'incident'
        }
      )
      // Crear incidente
      const incident = await Incident.create({
        date: data.date,
        routeRunId: data.routeRunId,
        description: data.description || 'null',
        placeId: place.id,
      })

      // Obtener archivos
      const files = request.files('files')

      console.log(`[Incident ${incident.id}] Recibidos ${files.length} archivo(s)`)

      // Procesar cada archivo
      for (let file of files) {
        try {
          // Generar nombre único
          const uniqueName = `${cuid()}-${Date.now()}${this.getFileExtension(file.clientName)}`
          const uploadPath = `incidents/${uniqueName}`

          console.log(`[Evidence] Guardando: ${file.clientName} -> ${uploadPath}`)

          // Guardar archivo en storage/uploads
          await file.move(Application.publicPath('uploads'), {
            name: uploadPath,
            overwrite: false,
          })

          if (file.hasErrors) {
            console.warn(`[Evidence] Error guardando ${file.clientName}:`, file.errors)
            continue
          }

          // Registrar evidencia en base de datos
          await Evidence.create({
            incidentId: incident.id,
            path: `uploads/${uploadPath}`, // Ruta relativa desde public
            fileName: file.clientName,
            fileType: file.headers['content-type'] || 'application/octet-stream',
            fileSize: file.size,
          })

          console.log(`[Evidence] Guardada: ${file.clientName}`)
        } catch (err) {
          console.error(`[Evidence] Error procesando archivo:`, err.message)
        }
      }

      // Cargar evidencias relacionadas
      await incident.load('evidences')

      return response.created({
        success: true,
        message: 'Incidente creado exitosamente',
        data: incident,
      })
    } catch (e) {
      console.error('[Incident] Error al crear:', e.message)

      if (e.messages) {
        return response.status(422).json({
          success: false,
          message: 'Error de validación',
          errors: e.messages,
        })
      }

      return response.status(400).json({
        success: false,
        message: e.message || 'Error al crear incidente',
      })
    }
  }

  // Obtener incidente con evidencias
  public async show({ params, response }: HttpContextContract) {
    try {
      const incident = await Incident.query()
        .where('id', params.id)
        .preload('evidences')
        .firstOrFail()

      return response.ok({
        success: true,
        data: incident,
      })
    } catch (e) {
      return response.notFound({
        success: false,
        message: 'Incidente no encontrado',
      })
    }
  }

  // Obtener todos los incidentes
  public async index({ response }: HttpContextContract) {
    try {
      const incidents = await Incident.query().preload('evidences').preload('routeRun')

      return response.ok({
        success: true,
        data: incidents,
      })
    } catch (e) {
      return response.status(400).json({
        success: false,
        message: 'Error al obtener incidentes',
      })
    }
  }

  // Eliminar incidente (soft delete)
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const incident = await Incident.findOrFail(params.id)
      await incident.delete()

      return response.ok({
        success: true,
        message: 'Incidente eliminado',
      })
    } catch (e) {
      return response.status(400).json({
        success: false,
        message: 'Error al eliminar incidente',
      })
    }
  }

  // Helpers
  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.')
    return parts.length > 1 ? '.' + parts[parts.length - 1] : ''
  }

  private getEvidenceType(mimeType: string): 'photo' | 'audio' | 'video' | 'file' {
    if (mimeType.startsWith('image/')) return 'photo'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.startsWith('video/')) return 'video'
    return 'file'
  }
}
