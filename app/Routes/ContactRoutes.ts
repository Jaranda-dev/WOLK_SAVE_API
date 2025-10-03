import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'ContactsController.index')
  Route.get('/:id', 'ContactsController.show')
  Route.post('/', 'ContactsController.store')
  Route.put('/:id', 'ContactsController.update')
  Route.delete('/:id', 'ContactsController.destroy')
})
.prefix('contacts')

