import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Route from './Route'
import Incident from './Incident'

export default class RouteRun extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public routeId: number

  @column()
  public userId: number

  @column.dateTime()
  public startTime: DateTime

  @column.dateTime()
  public endTime: DateTime

  @belongsTo(() => Route)
  public route: BelongsTo<typeof Route>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Incident)
  public incidents: HasMany<typeof Incident>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}