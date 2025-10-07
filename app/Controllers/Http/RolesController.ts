import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import CreateRoleValidator from 'App/Validators/Roles/CreateRoleValidator'
import UpdateRoleValidator from 'App/Validators/Roles/UpdateRoleValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'

export default class RolesController {
  // Obtener todos los roles
  public async index({ response }: HttpContextContract) {
    try {
      const roles = await Role.query().preload('users')
      return jsonResponse(response, 200, roles, 'Roles obtenidos exitosamente')
    } catch (e) {
      return jsonResponse(response, 500, null, e.message || 'Error al obtener roles', false)
    }
  }

  // Crear un nuevo rol
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateRoleValidator)
      const role = await Role.create(data)
      return jsonResponse(response, 201, role, 'Rol creado exitosamente')
    } catch (e) {
      if (e.messages) {
        return jsonResponse(response, 422, null, e.messages, false)
      }
      return jsonResponse(response, 400, null, e.message || 'Error al crear rol', false)
    }
  }

  // Mostrar un rol específico
  public async show({ params, response }: HttpContextContract) {
    try {
      const role = await Role.query()
        .where('id', params.id)
        .preload('users')
        .firstOrFail()
      return jsonResponse(response, 200, role, 'Rol obtenido exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Rol no encontrado', false)
    }
  }

  // Actualizar un rol
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateRoleValidator)
      const role = await Role.findOrFail(params.id)
      role.merge(data)
      await role.save()
      return jsonResponse(response, 200, role, 'Rol actualizado exitosamente')
    } catch (e) {
      if (e.messages) {
        return jsonResponse(response, 422, null, e.messages, false)
      }
      return jsonResponse(response, 400, null, e.message || 'Error al actualizar rol', false)
    }
  }

  // Eliminar un rol
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const role = await Role.findOrFail(params.id)
      await role.delete()
      return jsonResponse(response, 200, null, 'Rol eliminado exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Rol no encontrado', false)
    }
  }
}
