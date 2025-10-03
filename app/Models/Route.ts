import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo,hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Place from './Place'
import RouteRun from './RouteRun'

export default class Route extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public startPlaceId: number

  @column()
  public endPlaceId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Place, { foreignKey: 'startPlaceId' })
  public startPlace: BelongsTo<typeof Place>

  @belongsTo(() => Place, { foreignKey: 'endPlaceId' })
  public endPlace: BelongsTo<typeof Place>

  @hasMany(() => RouteRun)
  public runs: HasMany<typeof RouteRun>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}