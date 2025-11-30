// App/Services/Ws.ts

import Ws from 'App/Services/Ws'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id)

  // Enviar mensaje de bienvenida
  socket.emit('welcome', { message: 'Bienvenido al WebSocket!' })

  // Evento existente que escucha Postman o cliente
  socket.on('ping', (data) => {
    console.log('Recibido ping:', data)
    // Responder al mismo cliente
    socket.emit('pong', { message: 'pong', received: data })
  })

  // <<-- NUEVO EVENTO PARA RECIBIR Y RETRANSMITIR AUDIO -->>
  socket.on('audio-chunk', (audioData) => {
    console.log(`Recibido chunk de audio de ${socket.id}`);
    
    // Retransmitir el audio a todos los demás clientes conectados
    socket.broadcast.emit('audio-chunk-received', audioData);
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
})