import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'RoutesController.index')
  Route.get('/:id', 'RoutesController.show')
  Route.post('/', 'RoutesController.store')
  Route.put('/:id', 'RoutesController.update')
  Route.delete('/:id', 'RoutesController.destroy')
})
.prefix('routes')
.middleware(['auth'])