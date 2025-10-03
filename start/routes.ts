import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  require('App/Routes/ContactRoutes')
  require('App/Routes/EvidenceRoutes')
  require('App/Routes/IncidentRoutes')
  require('App/Routes/PlaceRoutes')
  require('App/Routes/ReportRoutes')
  require('App/Routes/RoleRoutes')
  require('App/Routes/RouteRoutes')
  require('App/Routes/RouteRunRoutes')
  require('App/Routes/UserRoutes')
}).prefix('/api/v1')
