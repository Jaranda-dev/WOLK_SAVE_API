import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'RouteRunsController.index')
  Route.get('/:id', 'RouteRunsController.show')
  Route.post('/', 'RouteRunsController.store')
  Route.put('/:id', 'RouteRunsController.update')
  Route.delete('/:id', 'RouteRunsController.destroy')
})
.prefix('runroutes')
.middleware(['auth'])