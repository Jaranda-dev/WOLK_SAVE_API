import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Report from 'App/Models/Report'
import CreateReportValidator from 'App/Validators/Reports/CreateReportValidator'
import UpdateReportValidator from 'App/Validators/Reports/UpdateReportValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'

export default class ReportsController {
  // Obtener todos los reportes
  public async index({ response }: HttpContextContract) {
    try {
      const reports = await Report.query()
        .preload('incident')
        .preload('evidences')
      return jsonResponse(response, 200, reports, 'Reportes obtenidos exitosamente')
    } catch (e) {
      return jsonResponse(response, 500, null, e.message || 'Error al obtener reportes', false)
    }
  }

  // Crear un nuevo reporte
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateReportValidator)
      const report = await Report.create(data)
      return jsonResponse(response, 201, report, 'Reporte creado exitosamente')
    } catch (e) {
      if (e.messages) {
        return jsonResponse(response, 422, null, e.messages, false)
      }

      return jsonResponse(response, 400, null, e.message || 'Error al crear reporte', false)
    }
  }

  // Mostrar un reporte específico
  public async show({ params, response }: HttpContextContract) {
    try {
      const report = await Report.query()
        .where('id', params.id)
        .preload('incident')
        .preload('evidences')
        .firstOrFail()

      return jsonResponse(response, 200, report, 'Reporte obtenido exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Reporte no encontrado', false)
    }
  }

  // Actualizar un reporte
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateReportValidator)
      const report = await Report.findOrFail(params.id)
      report.merge(data)
      await report.save()

      return jsonResponse(response, 200, report, 'Reporte actualizado exitosamente')
    } catch (e) {
      if (e.messages) {
        return jsonResponse(response, 422, null, e.messages, false)
      }

      return jsonResponse(response, 400, null, e.message || 'Error al actualizar reporte', false)
    }
  }

  // Eliminar un reporte
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const report = await Report.findOrFail(params.id)
      await report.delete()
      return jsonResponse(response, 200, null, 'Reporte eliminado exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Reporte no encontrado', false)
    }
  }
}
