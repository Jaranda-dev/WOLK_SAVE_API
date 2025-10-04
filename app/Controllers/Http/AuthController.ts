import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthValidator from 'App/Validators/Auth/AuthValidator'
import User from 'App/Models/User'

export default class AuthController {
  // Registro
  public async register({ request, response, auth }: HttpContextContract) {
    try {
      const data = await request.validate(AuthValidator)

      const user = await User.create({
        email: data.email,
        password: data.password,
        name: data.name,
        roleId: 2,
      })

      const token = await auth.use('api').login(user)

      return response.status(201).json({
        data: {
          user,
          token,
        },
        msg: 'Usuario registrado correctamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message,
        status: 'failed',
      })
    }
  }

  // Login
  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const { email, password } = await request.validate(AuthValidator)

      const token = await auth.use('api').attempt(email, password)

      return response.status(200).json({
        data: {
          user: auth.user,
          token,
        },
        msg: 'Login exitoso',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: 'Credenciales inválidas',
        status: 'failed',
      })
    }
  }

  // Logout
  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').logout()
    return response.status(200).json({
      data: null,
      msg: 'Sesión cerrada correctamente',
      status: 'success',
    })
  }
}