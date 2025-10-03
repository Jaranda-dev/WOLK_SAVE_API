import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import CreateRoleValidator from 'App/Validators/Roles/CreateRoleValidator'
import UpdateRoleValidator from 'App/Validators/Roles/UpdateRoleValidator'

export default class RolesController {
  // Obtener todos los roles
  public async index({ response }: HttpContextContract) {
    try {
      const roles = await Role.query().preload('users')
      return response.status(200).json({
        data: roles,
        msg: 'Roles obtenidos exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(500).json({
        data: null,
        msg: e.message || 'Error al obtener roles',
        status: 'failed',
      })
    }
  }

  // Crear un nuevo rol
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateRoleValidator)
      const role = await Role.create(data)
      return response.status(201).json({
        data: role,
        msg: 'Rol creado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al crear rol',
        status: 'failed',
      })
    }
  }

  // Mostrar un rol específico
  public async show({ params, response }: HttpContextContract) {
    try {
      const role = await Role.query()
        .where('id', params.id)
        .preload('users')
        .firstOrFail()
      return response.status(200).json({
        data: role,
        msg: 'Rol obtenido exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Rol no encontrado',
        status: 'failed',
      })
    }
  }

  // Actualizar un rol
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateRoleValidator)
      const role = await Role.findOrFail(params.id)
      role.merge(data)
      await role.save()
      return response.status(200).json({
        data: role,
        msg: 'Rol actualizado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al actualizar rol',
        status: 'failed',
      })
    }
  }

  // Eliminar un rol
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const role = await Role.findOrFail(params.id)
      await role.delete()
      return response.status(200).json({
        data: null,
        msg: 'Rol eliminado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Rol no encontrado',
        status: 'failed',
      })
    }
  }
}
