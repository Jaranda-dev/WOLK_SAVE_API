
import Hash from '@ioc:Adonis/Core/Hash'
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany ,beforeSave} from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import Contact from './Contact'
import Route from './Route'
import RouteRun from './RouteRun'
export default class User extends BaseModel {
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

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
