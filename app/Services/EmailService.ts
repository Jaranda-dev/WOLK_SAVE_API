import nodemailer from 'nodemailer'
import Env from '@ioc:Adonis/Core/Env'

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initialize()
  }

  private initialize() {
    try {
      const mailHost = Env.get('MAIL_HOST')
      const mailPort = Env.get('MAIL_PORT')
      const mailUser = Env.get('MAIL_USER')
      const mailPassword = Env.get('MAIL_PASSWORD')

      if (!mailHost || !mailPort || !mailUser || !mailPassword) {
        console.warn('[Email] Configuración de correo incompleta. Envío de correos deshabilitado.')
        return
      }

      this.transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailPort === 465, // true para puerto 465, false para otros
        auth: {
          user: mailUser,
          pass: mailPassword,
        },
      })

      console.log('[Email] Servicio inicializado correctamente')
    } catch (error) {
      console.error('[Email] Error inicializando servicio:', error)
    }
  }

  async sendVerificationCode(email: string, code: string, userName: string = 'Usuario'): Promise<boolean> {
    if (!this.transporter) {
      console.warn('[Email] Servicio no configurado. No se enviará correo.')
      return false
    }

    try {
      const fromName = Env.get('MAIL_FROM_NAME', 'WolkSafe')
      const fromEmail = Env.get('MAIL_FROM_EMAIL', Env.get('MAIL_USER'))

      const mailOptions = {
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: 'Código de Verificación - WolkSafe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>¡Bienvenido, ${userName}!</h2>
            <p>Tu código de verificación es:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff;">
                ${code}
              </span>
            </div>
            <p>Este código expira en 10 minutos.</p>
            <p><strong>Por seguridad, nunca compartas este código con nadie.</strong></p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Si no solicitaste este código, ignora este correo.
            </p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`[Email] Correo de verificación enviado a ${email}`)
      return true
    } catch (error) {
      console.error('[Email] Error enviando correo:', error)
      return false
    }
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('[Email] Servicio no configurado. No se enviará correo.')
      return false
    }

    try {
      const fromName = Env.get('MAIL_FROM_NAME', 'WolkSafe')
      const fromEmail = Env.get('MAIL_FROM_EMAIL', Env.get('MAIL_USER'))

      const mailOptions = {
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: 'Bienvenido a WolkSafe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>¡Bienvenido a WolkSafe, ${userName}!</h2>
            <p>Tu cuenta ha sido creada exitosamente.</p>
            <p>Ahora puedes acceder a la plataforma para gestionar tus incidentes de seguridad.</p>
            <p>Si tienes preguntas, contáctanos.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              © 2025 WolkSafe. Todos los derechos reservados.
            </p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`[Email] Correo de bienvenida enviado a ${email}`)
      return true
    } catch (error) {
      console.error('[Email] Error enviando correo de bienvenida:', error)
      return false
    }
  }
}

export default new EmailService()
