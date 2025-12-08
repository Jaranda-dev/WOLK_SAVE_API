import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'IncidentsController.index')
  Route.get('/:id', 'IncidentsController.show')
  Route.post('/', 'IncidentsController.store')
  Route.put('/:id', 'IncidentsController.update')
  Route.post('/:id/notification', 'IncidentsController.alertUsersIncident')
  Route.delete('/:id', 'IncidentsController.destroy')
})
.prefix('incidents')
.middleware(['auth'])