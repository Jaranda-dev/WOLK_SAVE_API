import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Incident from './Incident'
import Evidence from './Evidence'

export default class Report extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public incidentId: number

  @belongsTo(() => Incident)
  public incident: BelongsTo<typeof Incident>

  @hasMany(() => Evidence)
  public evidences: HasMany<typeof Evidence>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}