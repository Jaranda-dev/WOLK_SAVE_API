import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Report from 'App/Models/Report'
import CreateReportValidator from 'App/Validators/Reports/CreateReportValidator'
import UpdateReportValidator from 'App/Validators/Reports/UpdateReportValidator'

export default class ReportsController {
  // Obtener todos los reportes
  public async index({ response }: HttpContextContract) {
    try {
      const reports = await Report.query()
        .preload('incident')
        .preload('evidences')
      return response.status(200).json({
        data: reports,
        msg: 'Reportes obtenidos exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(500).json({
        data: null,
        msg: e.message || 'Error al obtener reportes',
        status: 'failed',
      })
    }
  }

  // Crear un nuevo reporte
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateReportValidator)
      const report = await Report.create(data)
      return response.status(201).json({
        data: report,
        msg: 'Reporte creado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al crear reporte',
        status: 'failed',
      })
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
      return response.status(200).json({
        data: report,
        msg: 'Reporte obtenido exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Reporte no encontrado',
        status: 'failed',
      })
    }
  }

  // Actualizar un reporte
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateReportValidator)
      const report = await Report.findOrFail(params.id)
      report.merge(data)
      await report.save()
      return response.status(200).json({
        data: report,
        msg: 'Reporte actualizado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al actualizar reporte',
        status: 'failed',
      })
    }
  }

  // Eliminar un reporte
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const report = await Report.findOrFail(params.id)
      await report.delete()
      return response.status(200).json({
        data: null,
        msg: 'Reporte eliminado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Reporte no encontrado',
        status: 'failed',
      })
    }
  }
}
