import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Incident from './Incident'
import Route from './Route'

export default class Place extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public lat: number

  @column()
  public long: number

  @column()
  public name: string

  @column()
  public type: 'routepoints' | 'incident' | 'desviation'

  @hasMany(() => Incident)
  public incidents: HasMany<typeof Incident>

  @hasMany(() => Route, { foreignKey: 'startPlaceId' })
  public startRoutes: HasMany<typeof Route>

  @hasMany(() => Route, { foreignKey: 'endPlaceId' })
  public endRoutes: HasMany<typeof Route>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}