import { DateTime } from 'luxon'
import { ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'

export default class SoftDeletes {
  public static boot() {
    /**
     * Hook que se aplica antes de cada fetch / find
     */
    this.addGlobalScope((query: ModelQueryBuilderContract<any>) => {
      query.whereNull('deleted_at')
    })
  }

  /**
   * Método para aplicar soft delete
   */
  public async softDelete(this: any) {
    this.deletedAt = DateTime.now()
    await this.save()
  }

  /**
   * Método para restaurar
   */
  public async restore(this: any) {
    this.deletedAt = null
    await this.save()
  }

  /**
   * Método para borrar definitivamente
   */
  public async forceDelete(this: any) {
    await this.delete()
  }
}
