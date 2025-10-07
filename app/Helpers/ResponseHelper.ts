import type { ResponseContract } from '@ioc:Adonis/Core/Response'

export const jsonResponse = (
  response: ResponseContract,
  status: number,
  data: any | null,
  msg: string,
  success: boolean = true
) => {
  return response.status(status).json({
    data,
    msg,
    status: success ? 'success' : 'failed',
  })
}
