import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'EvidencesController.index')
  Route.get('/:id', 'EvidencesController.show')
  Route.post('/', 'EvidencesController.store')
  Route.put('/:id', 'EvidencesController.update')
  Route.delete('/:id', 'EvidencesController.destroy')
  Route.get('/:id/file', 'EvidencesController.getEvidence')
})
.prefix('evidences')
.middleware(['auth'])