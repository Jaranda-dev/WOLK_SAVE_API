import Hash from '@ioc:Adonis/Core/Hash'

class CodeService {
  /**
   * Generar un código numérico de 6 dígitos
   */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Encriptar un código
   */
  async encryptCode(code: string): Promise<string> {
    return await Hash.make(code)
  }

  /**
   * Verificar un código contra su hash
   */
  async verifyCode(code: string, hash: string): Promise<boolean> {
    return await Hash.verify(hash, code)
  }
}

export default new CodeService()
