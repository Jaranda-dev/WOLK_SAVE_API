import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/Users/CreateUserValidator'
import UpdateUserValidator from 'App/Validators/Users/UpdateUserValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'
import { getUser, isAdminOrMonitor } from 'App/Helpers/AuthHelper'

export default class UsersController {
  // Consulta base con preloads
  private baseQuery() {
    return User.query()
      .preload('role')
      .preload('contacts')
      .preload('routes')
      .preload('routeRuns')
  }

  // Obtener todos los usuarios
  public async index({ response, auth }: HttpContextContract) {
    try {
      const userAuth = await getUser(auth)

      if (isAdminOrMonitor(userAuth)) {
        const users = await this.baseQuery()
          .whereNot('id', userAuth.id)
        return jsonResponse(response, 200, users, 'Usuarios obtenidos exitosamente')
      }

      const singleUser = await this.baseQuery()
        .where('id', userAuth.id)
        .firstOrFail()

      return jsonResponse(response, 200, singleUser, 'Usuario obtenido exitosamente')
    } catch (e: any) {
      const status = e.name === 'AuthenticationException' ? 401 : 500
      return jsonResponse(response, status, null, e.message || 'Error al obtener usuarios', false)
    }
  }

  // Crear un nuevo usuario
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateUserValidator)
      const user = await User.create(data)
      return jsonResponse(response, 201, user, 'Usuario creado exitosamente')
    } catch (e: any) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al crear usuario', false)
    }
  }

  // Mostrar un usuario específico
  public async show({ params, response, auth }: HttpContextContract) {
    try {
      const userAuth = await getUser(auth)
      const query = this.baseQuery().where('id', params.id)

      if (!isAdminOrMonitor(userAuth) && Number(params.id) !== userAuth.id) {
        return jsonResponse(response, 403, null, 'No tienes permisos para ver este usuario', false)
      }

      const user = await query.firstOrFail()
      return jsonResponse(response, 200, user, 'Usuario obtenido exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Usuario no encontrado', false)
    }
  }

  // Actualizar un usuario
  public async update({ params, request, response, auth }: HttpContextContract) {
    try {
      const userAuth = await getUser(auth)
      const data = await request.validate(UpdateUserValidator)

      const userToUpdate = isAdminOrMonitor(userAuth)
        ? await User.findOrFail(params.id)
        : await User.findOrFail(userAuth.id)

      userToUpdate.merge(data)
      await userToUpdate.save()

      return jsonResponse(
        response,
        200,
        userToUpdate,
        isAdminOrMonitor(userAuth)
          ? 'Usuario actualizado exitosamente'
          : 'Tu perfil fue actualizado exitosamente'
      )
    } catch (e: any) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al actualizar usuario', false)
    }
  }

  // Eliminar un usuario
  public async destroy({ params, response, auth }: HttpContextContract) {
    try {
      const userAuth = await getUser(auth)

      const userToDelete = isAdminOrMonitor(userAuth)
        ? await User.findOrFail(params.id)
        : Number(params.id) === userAuth.id
          ? await User.findOrFail(userAuth.id)
          : null

      if (!userToDelete) {
        return jsonResponse(response, 403, null, 'No tienes permisos para eliminar este usuario', false)
      }

      await userToDelete.delete()

      return jsonResponse(
        response,
        200,
        null,
        isAdminOrMonitor(userAuth)
          ? 'Usuario eliminado exitosamente'
          : 'Tu cuenta ha sido eliminada correctamente'
      )
    } catch {
      return jsonResponse(response, 404, null, 'Usuario no encontrado', false)
    }
  }
}
