import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import RegisterValidator from 'App/Validators/Auth/RegisterValidator'
import VerifyCodeValidator from 'App/Validators/Auth/VerifyCodeValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'
import FirebaseService from 'App/Services/FirebaseService'
import CodeService from 'App/Services/CodeService'
import EmailService from 'App/Services/EmailService'
import RecaptchaService from 'App/Services/RecaptchaService'

export default class AuthController {

  // Registro con 2FA
  public async register({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(RegisterValidator)

      // Verificar reCAPTCHA
      const recaptchaOk = await RecaptchaService.verify(data.recaptchaToken)
      if (!recaptchaOk) {
        return jsonResponse(response, 400, null, 'Validación reCAPTCHA fallida', false)
      }

      // Crear usuario
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        roleId: 3,
      })

      // Generar código
      const code = CodeService.generateCode()
      const encryptedCode = await CodeService.encryptCode(code)

      // Guardar código encriptado en BD
      user.code = encryptedCode
      await user.save()

      // Enviar código por email
      console.log('[Auth] Enviando código de verificación por email...')
      const emailSent = await EmailService.sendVerificationCode(user.email, code, user.name)
      console.log('[Auth] Resultado del envío de email:', { success: emailSent, email: user.email })

      return jsonResponse(
        response,
        201,
        { email: user.email, requiresCode: true },
        'Usuario registrado. Verifica el código enviado a tu correo'
      )
    } catch (e: any) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al registrar el usuario', false)
    }
  }

  // Login con 2FA
  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const { email, password, recaptchaToken } = await request.validate(LoginValidator)
      const recaptchaOk = await RecaptchaService.verify(recaptchaToken)
      if (!recaptchaOk) {
        return jsonResponse(response, 400, null, 'Validación reCAPTCHA fallida', false)
      }

      // Validar credenciales
      const token = await auth.use('api').attempt(email, password, { expiresIn: '7days' })
      const user = auth.use('api').user!

      // Generar código
      const code = CodeService.generateCode()
      const encryptedCode = await CodeService.encryptCode(code)

      // Guardar código encriptado en BD
      user.code = encryptedCode
      await user.save()

      // Enviar código por email
      console.log('[Auth] Enviando código de verificación por email (login)...')
      const emailSent = await EmailService.sendVerificationCode(user.email, code, user.name)
      console.log('[Auth] Resultado del envío de email (login):', { success: emailSent, email: user.email })

      return jsonResponse(
        response,
        200,
        { email: user.email, requiresCode: true },
        'Credenciales válidas. Verifica el código enviado a tu correo'
      )
    } catch (e: any) {
      if (e.code === 'E_ROW_NOT_FOUND') {
        return jsonResponse(response, 400, null, 'Credenciales inválidas', false)
      }
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, 'Credenciales inválidas', false)
    }
  }

  // Verificar código y generar token
  public async verifyCode({ request, response, auth }: HttpContextContract) {
    try {
      const { email, code, recaptchaToken } = await request.validate(VerifyCodeValidator)

      // Verificar reCAPTCHA
      const recaptchaOk = await RecaptchaService.verify(recaptchaToken)
      if (!recaptchaOk) {
        return jsonResponse(response, 400, null, 'Validación reCAPTCHA fallida', false)
      }

      // Buscar usuario
      const user = await User.findByOrFail('email', email)

      // Validar que tenga código
      if (!user.code) {
        return jsonResponse(response, 400, null, 'No hay código pendiente de verificación', false)
      }

      // Verificar código
      const isCodeValid = await CodeService.verifyCode(code, user.code)
      if (!isCodeValid) {
        return jsonResponse(response, 400, null, 'Código incorrecto', false)
      }

      // Limpiar código
      user.code = ''
      await user.save()

      // Generar token
      const token = await auth.use('api').login(user, { expiresIn: '7days' })

      // Enviar correo de bienvenida
      console.log('[Auth] Enviando correo de bienvenida...')
      const welcomeSent = await EmailService.sendWelcomeEmail(user.email, user.name)
      console.log('[Auth] Resultado del envío de correo de bienvenida:', { success: welcomeSent, email: user.email })

      return jsonResponse(response, 200, { user, token }, 'Autenticación completada exitosamente')
    } catch (e: any) {
      if (e.code === 'E_ROW_NOT_FOUND') {
        return jsonResponse(response, 404, null, 'Usuario no encontrado', false)
      }
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al verificar código', false)
    }
  }

  // Logout
  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').logout()
    return jsonResponse(response, 200, null, 'Sesión cerrada correctamente')
  }

  // Guardar FCM token
  public async saveFcmToken({ request, response, auth }: HttpContextContract) {
    try {
      const user = auth.use('api').user!
      const { fcmToken } = request.only(['fcmToken'])

      if (!fcmToken) {
        return jsonResponse(response, 400, null, 'Token FCM requerido', false)
      }

      // Guardar token en la BD
      user.tokenFirebase = fcmToken
      await user.save()

      console.log(`[Firebase] Token guardado para usuario ${user.id}: ${fcmToken}`)

      return jsonResponse(response, 200, { user }, 'Token FCM guardado correctamente')
    } catch (e) {
      console.error('[Firebase] Error guardando token:', e.message)
      return jsonResponse(response, 400, null, e.message || 'Error al guardar token', false)
    }
  }

  // Obtener token FCM del usuario
  public async getFcmToken({ request, response, auth }: HttpContextContract) {
    try {
      const user = auth.use('api').user!
      
      return jsonResponse(response, 200, { token: user.tokenFirebase }, 'Token obtenido')
    } catch (e) {
      return jsonResponse(response, 400, null, e.message, false)
    }
  }

  // Enviar notificación de prueba
  public async sendTestNotification({ response, auth }: HttpContextContract) {
    try {
      const user = auth.use('api').user!
      console.log(user)
      if (!user.tokenFirebase) {
        return jsonResponse(response, 400, null, 'Usuario sin token FCM', false)
      }

      const result = await FirebaseService.sendNotification(
        user.tokenFirebase,
        'Notificación de Prueba',
        'Esta es una notificación de prueba desde el backend'
      )

      console.log('[Firebase] Notificación de prueba enviada:', result)

      return jsonResponse(response, 200, { notificationId: result }, 'Notificación enviada')
    } catch (e) {
      console.error('[Firebase] Error enviando notificación de prueba:', e.message)
      return jsonResponse(response, 400, null, e.message, false)
    }
  }
}