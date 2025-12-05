import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'IncidentTypesController.index')
})
.prefix('incidenttype')
.middleware(['auth'])
