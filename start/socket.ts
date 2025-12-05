// App/Services/Ws.ts

import Ws from 'App/Services/Ws'
import { isAdminOrMonitor } from 'App/Helpers/AuthHelper'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  const connectedUser = (socket.data && (socket.data as any).user) || null
  socket.emit('welcome', { message: 'Bienvenido al WebSocket!', socketId: socket.id, user: connectedUser })
  socket.on('ping', (data) => {
    socket.emit('pong', { message: 'pong', received: data })
  })

  // Admin subscribes to listen a specific user
  // payload: { targetUserId }
  socket.on('start-listening', (payload) => {
    const user = (socket.data && (socket.data as any).user) || null
    const targetUserId = payload && payload.targetUserId
    if (!user) return socket.emit('error', { message: 'Not authenticated' })
    if (!isAdminOrMonitor(user)) return socket.emit('error', { message: 'Insufficient permissions' })
    if (!targetUserId) return socket.emit('error', { message: 'targetUserId required' })
    socket.join(`listen:${targetUserId}`)
    socket.emit('listening-started', { targetUserId })
  })

  // Admin stops listening
  socket.on('stop-listening', (payload) => {
    const user = (socket.data && (socket.data as any).user) || null
    const targetUserId = payload && payload.targetUserId
    if (!user) return socket.emit('error', { message: 'Not authenticated' })
    if (!isAdminOrMonitor(user)) return socket.emit('error', { message: 'Insufficient permissions' })
    if (!targetUserId) return socket.emit('error', { message: 'targetUserId required' })
    socket.leave(`listen:${targetUserId}`)
    socket.emit('listening-stopped', { targetUserId })
  })

  // to that user's listeners room: `listen:{userId}`.
  socket.on('audio-chunk', (payload) => {
    const user = (socket.data && (socket.data as any).user) || null
    if (!user) {
      return
    }
    const audioData = payload && (payload.audioData !== undefined ? payload.audioData : payload)
    Ws.io.to(`listen:${user.id}`).emit('audio-chunk-received', { fromUserId: user.id, audioData })
  })
  // Forward location updates from a user to any admins/monitors listening to them
  // payload: { lat: number, long: number, timestamp?: string }
  socket.on('location-update', (payload) => {
    
    const user = (socket.data && (socket.data as any).user) || null
    if (!user) return
    const location = payload && payload.location !== undefined ? payload.location : payload
    // Emit to listeners room for this user
    Ws.io.to(`listen:${user.id}`).emit('location-update', { fromUserId: user.id, location })
  })
    socket.on('disconnect', () => {
  })
})