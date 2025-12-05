import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Incident from 'App/Models/Incident'
import CreateIncidentValidator from 'App/Validators/Incidents/CreateIncidentValidator'
import UpdateIncidentValidator from 'App/Validators/Incidents/UpdateIncidentValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'
import Evidence from "App/Models/Evidence"
import { cuid } from "@ioc:Adonis/Core/Helpers"
import Application from '@ioc:Adonis/Core/Application'
import Place from 'App/Models/Place'
import { getUser, isAdminOrMonitor } from 'App/Helpers/AuthHelper'

export default class IncidentsController {// Crear un nuevo incidente con archivos
  public async store({ request, response }: HttpContextContract) {
    try {
      // Validar datos
      const data = await request.validate(CreateIncidentValidator)

      const place = await Place.create(
        {
          lat:data.lat,
          long:data.lng,
          name: data.ubicacion,
          type:'incident'
        }
      )
      // Crear incidente
      const incident = await Incident.create({
        date: data.date,
        routeRunId: data.routeRunId,
        description: data.description || 'null',
        placeId: place.id,
        incidentTypeId:data.incidentTypeId
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

          // Guardar archivo en el root configurado para Drive (Application.tmpPath('uploads'))
          // así Drive.exists/getStream podrán localizarlo usando la misma ruta relativa
          await file.move(Application.tmpPath('uploads'), {
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
            // Guardamos la ruta relativa al disco (no incluimos el prefijo 'uploads/')
            path: uploadPath,
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

      return jsonResponse(response, 201, incident, 'Recorridos obtenidos exitosamente')
      
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
  public async index({ response , auth}: HttpContextContract) {
    try {
      const user = await getUser(auth)
       const query =  Incident.query().preload('place').preload('incidentType').preload('evidences').preload('routeRun',(rr) => rr.preload('route',(r) => r.preload('startPlace').preload('endPlace')).preload('user'))
      if (!isAdminOrMonitor(user)) {
        query.whereHas('routeRun', (qr) => qr.where('user_id', user.id))
      }

      const incidents = await query
      console.log(incidents)
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

    // Actualizar un lugar
    public async update({ params, request, response }: HttpContextContract) {
      try {
        const data = await request.validate(UpdateIncidentValidator)
        console.log(data)
        const place = await Incident.findOrFail(params.id)
        place.merge(data as any)
        await place.save()
        return jsonResponse(response, 200, place, 'Lugar actualizado exitosamente')
      } catch (e) {
        const msg = e.messages || e.message || 'Error al actualizar lugar'
        return jsonResponse(response, 400, null, msg, false)
      }
    }


  // Helpers
  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.')
    return parts.length > 1 ? '.' + parts[parts.length - 1] : ''
  }
}
