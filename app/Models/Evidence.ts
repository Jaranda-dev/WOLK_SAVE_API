import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Report from './Report'
import SoftDeletes from './Traits/SoftDeletes'

export default class Evidence extends BaseModel  {
  public static boot() {
      if ((this as any).booted) {
        return
      }
      super.boot()
      SoftDeletes(this)
    }
    
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: 'photo' | 'audio'

  @column()
  public path: string

  @column()
  public reportId: number

  @belongsTo(() => Report)
  public report: BelongsTo<typeof Report>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ columnName: 'deleted_at' })
  public deletedAt: DateTime | null
}