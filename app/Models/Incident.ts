import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Place from './Place'
import RouteRun from './RouteRun'
import Evidence from './Evidence'
import SoftDeletes from './Traits/SoftDeletes'

export default class Incident extends BaseModel {
  public static boot() {
      if ((this as any).booted) {
        return
      }
      super.boot()
      SoftDeletes(this)
    }
  @column({ isPrimary: true })
  public id: number

  @column.date()
  public date: DateTime

  @column()
  public description: string

  @column()
  public placeId: number

  @column()
  public routeRunId: number  

  @belongsTo(() => Place)
  public place: BelongsTo<typeof Place>

  @belongsTo(() => RouteRun)
  public routeRun: BelongsTo<typeof RouteRun>

  @hasMany(() => Evidence)
  public evidences: HasMany<typeof Evidence>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
  
  @column.dateTime({ columnName: 'deleted_at' })
  public deletedAt: DateTime | null
}