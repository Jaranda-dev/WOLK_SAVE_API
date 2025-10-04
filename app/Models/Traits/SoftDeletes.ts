import { DateTime } from 'luxon'
import { BaseModel, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'

export default function SoftDeletes(Model: typeof BaseModel) {
  if ((Model as any).__softDeletesApplied) return
  ;(Model as any).__softDeletesApplied = true

  // Filtro global para soft deletes
  const applySoftDeleteFilter = (query: ModelQueryBuilderContract<any>) => {
    if (!(query as any).__withTrashed) {
      query.whereNull('deleted_at')
    }
  }

  Model.before('find', applySoftDeleteFilter)
  Model.before('fetch', applySoftDeleteFilter)
  Model.before('paginate', ([countQuery, mainQuery]: [ModelQueryBuilderContract<any>, ModelQueryBuilderContract<any>]) => {
    applySoftDeleteFilter(countQuery)
    applySoftDeleteFilter(mainQuery)
  })

  // Métodos de instancia
  ;(Model.prototype as any).softDelete = async function () {
    this.deletedAt = DateTime.now()
    await this.save()
  }

  ;(Model.prototype as any).restore = async function () {
    this.deletedAt = null
    await this.save()
  }

  ;(Model.prototype as any).forceDelete = async function () {
    const ModelClass = this.constructor as typeof BaseModel
    await ModelClass.query().where('id', (this as any).id).delete()
  }

  ;(Model.prototype as any).delete = async function () {
    await (this as any).softDelete()
  }

  Object.defineProperty(Model.prototype, 'trashed', {
    get() {
      return !!(this as any).deletedAt
    },
    enumerable: true,
    configurable: true,
  })

  // Helpers estáticos
  ;(Model as any).withTrashed = function () {
    const q = this.query()
    ;(q as any).__withTrashed = true
    return q
  }

  ;(Model as any).onlyTrashed = function () {
    return this.withTrashed().whereNotNull('deleted_at')
  }
}
