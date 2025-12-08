import { Resend } from 'resend'
import Env from '@ioc:Adonis/Core/Env'

class EmailService {
  private resend: Resend | null = null

  constructor() {
    this.initialize()
  }

  private initialize() {
    try {
      const apiKey = Env.get('RESEND_API_KEY') as string | undefined
      console.log('[Email] Inicializando Resend...')
      console.log('[Email] RESEND_API_KEY present:', !!apiKey)
      if (!apiKey) {
        console.warn('[Email] RESEND_API_KEY no configurado; envío de correos deshabilitado.')
        return
      }

      this.resend = new Resend(apiKey)
      console.log('[Email] Servicio Resend inicializado correctamente')
    } catch (error) {
      console.error('[Email] Error inicializando Resend:', error)
    }
  }

  async sendVerificationCode(email: string, code: string, userName: string = 'Usuario'): Promise<boolean> {
    console.log('[Email] Iniciando envío de código de verificación', { email, userName })
    if (!this.resend) {
      console.error('[Email] Servicio Resend NO está configurado (null). No se enviará correo.')
      return false
    }

    try {
      const fromName = Env.get('MAIL_FROM_NAME', 'WolkSafe')
      const fromEmail = Env.get('MAIL_FROM_EMAIL', 'noreply@wolksafe.com')
      console.log('[Email] Configuración:', { fromName, fromEmail, to: email })

      console.log('[Email] Llamando a resend.emails.send()...')
      const response = await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: 'Código de Verificación - WolkSafe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">¡Bienvenido, ${userName}!</h2>
              <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Tu código de verificación es:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #007bff; font-family: 'Courier New', monospace;">
                  ${code}
                </span>
              </div>
              <p style="color: #999; font-size: 14px; margin-bottom: 20px;">Este código expira en 10 minutos.</p>
              <p style="color: #d9534f; font-weight: bold; font-size: 14px;">Por seguridad, nunca compartas este código con nadie.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">
                Si no solicitaste este código, ignora este correo.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                © 2025 WolkSafe. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `,
      })

      console.log('[Email] Respuesta de Resend:', { hasError: !!response.error, id: response.data?.id })

      if (response.error) {
        console.error('[Email] ERROR enviando correo de verificación:', JSON.stringify(response.error))
        return false
      }

      console.log(`[Email] ✓ Correo de verificación enviado exitosamente a ${email}. ID: ${response.data?.id}`)
      return true
    } catch (error) {
      console.error('[Email] EXCEPCIÓN enviando correo de verificación:', {
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack',
      })
      return false
    }
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    console.log('[Email] Iniciando envío de correo de bienvenida', { email, userName })
    if (!this.resend) {
      console.error('[Email] Servicio Resend NO está configurado (null). No se enviará correo.')
      return false
    }

    try {
      const fromName = Env.get('MAIL_FROM_NAME', 'WolkSafe')
      const fromEmail = Env.get('MAIL_FROM_EMAIL', 'noreply@wolksafe.com')
      console.log('[Email] Configuración:', { fromName, fromEmail, to: email })

      console.log('[Email] Llamando a resend.emails.send()...')
      const response = await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: 'Bienvenido a WolkSafe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">¡Bienvenido a WolkSafe, ${userName}!</h2>
              <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                Tu cuenta ha sido creada exitosamente. Ahora puedes acceder a la plataforma para gestionar tus incidentes de seguridad.
              </p>
              <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                Si tienes preguntas o necesitas ayuda, no dudes en contactarnos.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">
                © 2025 WolkSafe. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `,
      })

      console.log('[Email] Respuesta de Resend:', { hasError: !!response.error, id: response.data?.id })

      if (response.error) {
        console.error('[Email] ERROR enviando correo de bienvenida:', JSON.stringify(response.error))
        return false
      }

      console.log(`[Email] ✓ Correo de bienvenida enviado exitosamente a ${email}. ID: ${response.data?.id}`)
      return true
    } catch (error) {
      console.error('[Email] EXCEPCIÓN enviando correo de bienvenida:', {
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack',
      })
      return false
    }
  }
}

export default new EmailService()
