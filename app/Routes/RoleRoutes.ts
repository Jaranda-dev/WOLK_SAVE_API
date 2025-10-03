import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'RolesController.index')
  Route.get('/:id', 'RolesController.show')
  Route.post('/', 'RolesController.store')
  Route.put('/:id', 'RolesController.update')
  Route.delete('/:id', 'RolesController.destroy')
})
.prefix('roles')
.middleware(['auth'])