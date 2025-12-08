import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth')
}).prefix('auth')


Route.group(() => {
    // Guardar token FCM después del login
    Route.post('users/:id/fcm-token', 'AuthController.saveFcmToken')
    
    // Obtener token FCM del usuario actual
    Route.get('users/fcm-token', 'AuthController.getFcmToken')
    
    // Enviar notificación de prueba
    Route.post('notifications/test', 'AuthController.sendTestNotification')

}).middleware('auth')
