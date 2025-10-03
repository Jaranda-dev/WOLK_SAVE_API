import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'PlacesController.index')
  Route.get('/:id', 'PlacesController.show')
  Route.post('/', 'PlacesController.store')
  Route.put('/:id', 'PlacesController.update')
  Route.delete('/:id', 'PlacesController.destroy')
})
.prefix('places')
.middleware(['auth'])