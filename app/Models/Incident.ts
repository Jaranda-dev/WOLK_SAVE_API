import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column, 
  belongsTo, 
  BelongsTo, 
  hasMany, 
  HasMany 
} from '@ioc:Adonis/Lucid/Orm'

import Place from './Place'
import RouteRun from './RouteRun'
import Evidence from './Evidence'
import IncidentType from './IncidentType'
import SoftDeletes from './Traits/SoftDeletes'

export default class Incident extends BaseModel {
  public static boot() {
    if ((this as any).booted) {
      return
    }
    super.boot()
    SoftDeletes(this)
  }

  /*
  |--------------------------------------------------------------------------
  | Columns
  |--------------------------------------------------------------------------
  */

  @column({ isPrimary: true })
  public id: number

  @column.dateTime()
  public date: DateTime

  @column()
  public description: string | null

  @column({ columnName: 'type_incident_id' })
  public incidentTypeId: number

  @column()
  public placeId: number

  @column()
  public routeRunId: number

  @column()
  public status: 'revision' | 'revisado'

  @column()
  public type: 'sin_riesgo' | 'molestias' | 'peligroso' | 'muy_peligroso'

  /*
  |--------------------------------------------------------------------------
  | Relationships
  |--------------------------------------------------------------------------
  */

  @belongsTo(() => Place)
  public place: BelongsTo<typeof Place>

  @belongsTo(() => RouteRun)
  public routeRun: BelongsTo<typeof RouteRun>

  @belongsTo(() => IncidentType)
  public incidentType: BelongsTo<typeof IncidentType>

  @hasMany(() => Evidence)
  public evidences: HasMany<typeof Evidence>

  /*
  |--------------------------------------------------------------------------
  | Timestamps
  |--------------------------------------------------------------------------
  */

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ columnName: 'deleted_at' })
  public deletedAt: DateTime | null
}
