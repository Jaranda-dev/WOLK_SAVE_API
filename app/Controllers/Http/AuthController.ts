import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import RegisterValidator from 'App/Validators/Auth/RegisterValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'

export default class AuthController {

  // Registro
  public async register({ request, response, auth }: HttpContextContract) {
    try {
      const data = await request.validate(RegisterValidator)

      const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        roleId: 3,
      })

      const token = await auth.use('api').login(user, { expiresIn: '7days' })

      return jsonResponse(response, 201, { user, token }, 'Usuario registrado correctamente')
    } catch (e) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al registrar el usuario', false)
    }
  }

  // Login
  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const { email, password } = await request.validate(LoginValidator)

      const token = await auth.use('api').attempt(email, password, { expiresIn: '7days' })
      const user = auth.use('api').user!

      return jsonResponse(response, 200, { user, token }, 'Login exitoso')
    } catch (e) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, 'Credenciales inválidas', false)
    }
  }

  // Logout
  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').logout()
    return jsonResponse(response, 200, null, 'Sesión cerrada correctamente')
  }
}
