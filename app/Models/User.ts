
import Hash from '@ioc:Adonis/Core/Hash'
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany ,beforeSave} from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import Contact from './Contact'
import Route from './Route'
import RouteRun from './RouteRun'
import SoftDeletes from './Traits/SoftDeletes'
export default class User extends BaseModel {
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
  public name: string

  @column()
  public roleId: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken: string | null

  @belongsTo(() => Role)
  public role: BelongsTo<typeof Role>

  @hasMany(() => Contact)
  public contacts: HasMany<typeof Contact>

  @hasMany(() => Route)
  public routes: HasMany<typeof Route>
  
  @hasMany(() => RouteRun)
  public routeRuns: HasMany<typeof RouteRun>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ columnName: 'deleted_at' })
  public deletedAt: DateTime | null

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
