import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { jsonResponse } from 'App/Helpers/ResponseHelper'
import IncidentType from 'App/Models/IncidentType'
export default class IncidentTypesController {

      public async index({ response }: HttpContextContract) {
        try {
          const places = await IncidentType.query()
          return jsonResponse(response, 200, places, 'Tipos de incidentes obtenidos exitosamente')
        } catch (e) {
          return jsonResponse(response, 500, null, e.message || 'Error al obtener tipos de incidentes', false)
        }
      }
}
