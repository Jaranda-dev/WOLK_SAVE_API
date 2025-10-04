import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/Users/CreateUserValidator'
import UpdateUserValidator from 'App/Validators/Users/UpdateUserValidator'


export default class UsersController {
  // Obtener todos los usuarios
public async index({ response, auth }: HttpContextContract) {
  try {
    const user = auth.user

    if (!user) {
      return response.status(401).json({
        data: null,
        msg: 'No autenticado',
        status: 'failed',
      })
    }

    // si es administrador
    if (user.roleId === 1) {
      const users = await User.query()
        .preload('role')
        .preload('contacts')
        .preload('routes')
        .preload('routeRuns')
        .whereNot('id', user.id)

      return response.status(200).json({
        data: users,
        msg: 'Usuarios obtenidos exitosamente',
        status: 'success',
      })
    }

    // si no es admin, solo devuelve su propio usuario
    const singleUser = await User.query()
      .where('id', user.id)
      .preload('role')
      .preload('contacts')
      .preload('routes')
      .preload('routeRuns')
      .firstOrFail()

    return response.status(200).json({
      data: singleUser,
      msg: 'Usuario obtenido exitosamente',
      status: 'success',
    })
  } catch (e) {
    return response.status(500).json({
      data: null,
      msg: e.message || 'Error al obtener usuarios',
      status: 'failed',
    })
  }
}


  // Crear un nuevo usuario
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateUserValidator)
      const user = await User.create(data)
      return response.status(201).json({
        data: user,
        msg: 'Usuario creado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al crear usuario',
        status: 'failed',
      })
    }
  }

  // Mostrar un usuario específico
  public async show({ params, response }: HttpContextContract) {
    try {
      const user = await User.query()
        .where('id', params.id)
        .preload('role')
        .preload('contacts')
        .preload('routes')
        .preload('routeRuns')
        .firstOrFail()
      return response.status(200).json({
        data: user,
        msg: 'Usuario obtenido exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Usuario no encontrado',
        status: 'failed',
      })
    }
  }

// Actualizar un usuario
public async update({ params, request, response, auth }: HttpContextContract) {
  const userAuth = auth.user

  try {

    const data = await request.validate(UpdateUserValidator)

    if (!userAuth) {
      return response.status(401).json({
        data: null,
        msg: 'No autenticado',
        status: 'failed',
      })
    }

    // Si es admin -> puede actualizar a cualquiera
    if (userAuth.roleId === 1) {
      const user = await User.findOrFail(params.id)
      user.merge(data)
      await user.save()

      return response.status(200).json({
        data: user,
        msg: 'Usuario actualizado exitosamente',
        status: 'success',
      })
    }

    // Si NO es admin -> solo puede actualizarse a sí mismo
    const user = await User.findByOrFail('id', userAuth.id)
    user.merge(data)
    await user.save()

    return response.status(200).json({
      data: user,
      msg: 'Tu perfil fue actualizado exitosamente',
      status: 'success',
    })
  } catch (e) {
    return response.status(400).json({
      data: null,
      msg: e.messages || e.message || 'Error al actualizar usuario',
      status: 'failed',
    })
  }
}


// Eliminar un usuario
public async destroy({ params, response, auth }: HttpContextContract) {
  const userAuth = auth.user

  try {
    if (!userAuth) {
      return response.status(401).json({
        data: null,
        msg: 'No autenticado',
        status: 'failed',
      })
    }

    // Si es admin puede eliminar a cualquiera
    if (userAuth.roleId === 1) {
      const user = await User.findOrFail(params.id)
      await user.delete()
      return response.status(200).json({
        data: null,
        msg: 'Usuario eliminado exitosamente',
        status: 'success',
      })
    }

    // Si no es admin, solo puede eliminar su propia cuenta
    if (userAuth.id !== Number(params.id)) {
      return response.status(403).json({
        data: null,
        msg: 'No tienes permisos para eliminar este usuario',
        status: 'failed',
      })
    }

    const user = await User.findOrFail(userAuth.id)
    await user.delete()

    return response.status(200).json({
      data: null,
      msg: 'Tu cuenta ha sido eliminada correctamente',
      status: 'success',
    })
  } catch (e) {
    return response.status(404).json({
      data: null,
      msg: 'Usuario no encontrado',
      status: 'failed',
    })
  }
}


}
