import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import SoftDeletes from './Traits/SoftDeletes'

export default class Contact extends BaseModel {
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
  public phone: string

  @column()
  public email: string

  @column()
  public name: string

  @column()
  public direction: string

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ columnName: 'deleted_at' })
  public deletedAt: DateTime | null
  
}