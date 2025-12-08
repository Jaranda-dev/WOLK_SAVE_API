import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'
import HttpContext from '@ioc:Adonis/Core/HttpContext'


class Ws {
  public io: Server
  private booted = false

  public boot() {

    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: ['https://vkf1xfcn-8100.usw3.devtunnels.ms','http://localhost:8100'],
        methods: ['GET', 'POST'],
      },
    })

    // Socket authentication middleware: optional but will attach `socket.data.user`
    // if a valid API token is provided in `handshake.auth.token` or
    // `handshake.query.token` or `handshake.headers.authorization`.
    this.io.use(async (socket, next) => {
      try {
        const auth = (socket.handshake as any).auth || {}
        let token: string | undefined = auth.token || (socket.handshake as any).query?.token
        const authHeader = (socket.handshake as any).headers?.authorization
        if (!token && typeof authHeader === 'string') {
          token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
        }

        
        if (!token) {
          return next(new Error('Unauthorized')) // obligar token
        }

        // Crear un HttpContext temporal con la forma esperada por Adonis Request
        const fakeReq: any = {
          url: '/',
          method: 'GET',
          headers: { authorization: `Bearer ${token}` },
          connection: { remoteAddress: '127.0.0.1', encrypted: false },
        }
        
        // Some internals expect the raw incoming message under `request`,
        // while others read headers directly from the object. Provide both.
        fakeReq.request = { url: fakeReq.url, method: fakeReq.method, headers: fakeReq.headers, connection: fakeReq.connection }

        const fakeResInner: any = {
          getHeaders: () => ({}),
          setHeader: () => {},
          removeHeader: () => {},
          end: () => {},
        }
        const fakeRes: any = {
          response: fakeResInner,
          ...fakeResInner,
        }

        const ctx = HttpContext.create('/', {}, fakeReq as any, fakeRes as any)
        

        // Usar el guard 'api' de Adonis para autenticar el token
        await ctx.auth.use('api').authenticate()
        const user = ctx.auth.user as any
        if (!user) {
          return next(new Error('Unauthorized'))
        }

        socket.data.user = { id: user.id, roleId: user.roleId, name: user.name }
        
        return next()
      } catch (err) {
        return next(new Error('Unauthorized'))
      }
    })
  }
}

export default new Ws()