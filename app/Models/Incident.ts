import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Place from './Place'
import Report from './Report'
import RouteRun from './RouteRun'

export default class Incident extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.date()
  public date: DateTime

  @column()
  public placeId: number

  @column()
  public routeRunId: number  

  @belongsTo(() => Place)
  public place: BelongsTo<typeof Place>

  @belongsTo(() => RouteRun)
  public routeRun: BelongsTo<typeof RouteRun>

  @hasMany(() => Report)
  public reports: HasMany<typeof Report>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}