import Env from '@ioc:Adonis/Core/Env'

type RecaptchaResponse = {
  success: boolean
  score?: number
  action?: string
  'error-codes'?: string[]
}

class RecaptchaService {
  /**
   * Verifica un token de reCAPTCHA v3 con Google.
   * Retorna true si es válido y supera el umbral de score.
   */
  async verify(token: string, minScore = 0.5): Promise<boolean> {
    const secret = Env.get('RECAPTCHA_SECRET') as string | undefined
    if (!secret) {
      console.warn('[reCAPTCHA] RECAPTCHA_SECRET no configurado; se omite verificación')
      return true
    }

    if (!token) return false

    try {
      const params = new URLSearchParams()
      params.append('secret', secret)
      params.append('response', token)

      const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      const data = (await res.json()) as RecaptchaResponse

      if (!data.success) {
        console.warn('[reCAPTCHA] Verificación fallida:', data['error-codes'])
        return false
      }

      if (typeof data.score === 'number' && data.score < minScore) {
        console.warn('[reCAPTCHA] Puntaje bajo:', data.score)
        return false
      }

      return true
    } catch (error) {
      console.error('[reCAPTCHA] Error verificando:', error)
      return false
    }
  }
}

export default new RecaptchaService()