import Ws from 'App/Services/Ws'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id)

  // Enviar mensaje de bienvenida
  socket.emit('welcome', { message: 'Bienvenido al WebSocket!' })

  // Evento que escucha Postman o cliente
  socket.on('ping', (data) => {
    console.log('Recibido ping:', data)
    // Responder al mismo cliente
    socket.emit('pong', { message: 'pong', received: data })
  })
})

