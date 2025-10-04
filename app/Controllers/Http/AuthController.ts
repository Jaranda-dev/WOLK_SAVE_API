import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import RegisterValidator from 'App/Validators/Auth/RegisterValidator'

export default class AuthController {
  // Registro
  public async register({ request, response, auth }: HttpContextContract) {
    try {
      const data = await request.validate(RegisterValidator)

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
      // Ver qué datos llegan
      console.log('Request body:', request.all())

      // Validar request
      let email: string, password: string
      try {
        const validated = await request.validate(LoginValidator)
        email = validated.email.trim()
        password = validated.password.trim()
        console.log('Datos validados:', email, password)
      } catch (validationError) {
        console.log('Errores de validación:', validationError.messages)
        return response.status(422).json({
          data: null,
          msg: 'Errores de validación',
          errors: validationError.messages,
          status: 'failed',
        })
      }

      // Buscar usuario ignorando soft deletes
      const user = await User.query()
        .where('email', email)
        // Si quieres excluir soft deleted, descomenta la siguiente línea:
        // .whereNull('deleted_at')
        .firstOrFail()

      // Logs de depuración
      console.log('------------------- LOGIN DEBUG -------------------')
      console.log('Usuario encontrado:', user.email)
      console.log('Hash en DB:', user.password)
      console.log('Password input:', password)
      console.log('---------------------------------------------------')

      // Verificar contraseña
      const isPasswordValid = await Hash.verify(user.password, password)
      console.log('Password válido:', isPasswordValid)

      if (!isPasswordValid) {
        return response.status(400).json({
          data: null,
          msg: 'Credenciales inválidas',
          status: 'failed',
        })
      }

      // Generar token
      const token = await auth.use('api').login(user)

      // Retornar usuario sin password
      const userData = user.serialize()
      delete userData.password

      return response.status(200).json({
        data: {
          user: userData,
          token,
        },
        msg: 'Login exitoso',
        status: 'success',
      })
    } catch (e) {
      console.log('Error login:', e)
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