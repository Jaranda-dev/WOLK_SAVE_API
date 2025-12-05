import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Incident from './Incident'
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

  @column({ columnName: 'file_type' })
  public fileType: string

  @column({ columnName: 'file_name' })
  public fileName: string | null

  @column()
  public fileSize: number | null

  @column()
  public path: string

  @column({ columnName: 'incident_id' })
  public incidentId: number

  @belongsTo(() => Incident)
  public incident: BelongsTo<typeof Incident>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ columnName: 'deleted_at' })
  public deletedAt: DateTime | null
}