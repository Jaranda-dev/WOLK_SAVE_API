import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'ReportsController.index')
  Route.get('/:id', 'ReportsController.show')
  Route.post('/', 'ReportsController.store')
  Route.put('/:id', 'ReportsController.update')
  Route.delete('/:id', 'ReportsController.destroy')
})
.prefix('reports')
.middleware(['auth'])