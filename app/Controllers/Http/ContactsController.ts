import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Contact from 'App/Models/Contact'
import CreateContactValidator from 'App/Validators/Contacts/CreateContactValidator'
import UpdateContactValidator from 'App/Validators/Contacts/UpdateContactValidator'
import { jsonResponse } from 'App/Helpers/ResponseHelper'
import { getUser, isAdminOrMonitor } from 'App/Helpers/AuthHelper'

export default class ContactsController {
  // Consulta base con preloads
  private baseQuery() {
    return Contact.query().preload('user')
  }

  // Obtener todos los contactos
  public async index({ response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const query = this.baseQuery()

      // Filtrar solo los propios si no es admin/monitoreador
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const contacts = await query
      return jsonResponse(response, 200, contacts, 'Contactos obtenidos exitosamente')
    } catch (e: any) {
      const status = e.name === 'AuthenticationException' ? 401 : 500
      return jsonResponse(response, status, null, e.message || 'Error al obtener contactos', false)
    }
  }

  // Crear un nuevo contacto
  public async store({ request, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const data = await request.validate(CreateContactValidator)

      // Si no es admin/monitoreador, asignar el userId
      if (!isAdminOrMonitor(user)) data.userId = user.id

      const contact = await Contact.create(data)
      return jsonResponse(response, 201, contact, 'Contacto creado exitosamente')
    } catch (e: any) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al crear contacto', false)
    }
  }

  // Mostrar un contacto específico
  public async show({ params, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const query = this.baseQuery().where('id', params.id)

      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const contact = await query.firstOrFail()
      return jsonResponse(response, 200, contact, 'Contacto obtenido exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Contacto no encontrado', false)
    }
  }

  // Actualizar un contacto existente
  public async update({ params, request, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const data = await request.validate(UpdateContactValidator)

      const query = Contact.query().where('id', params.id)
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const contact = await query.firstOrFail()
      contact.merge(data)
      await contact.save()

      return jsonResponse(response, 200, contact, 'Contacto actualizado exitosamente')
    } catch (e: any) {
      if (e.messages) return jsonResponse(response, 422, null, e.messages, false)
      return jsonResponse(response, 400, null, e.message || 'Error al actualizar contacto', false)
    }
  }

  // Eliminar un contacto
  public async destroy({ params, response, auth }: HttpContextContract) {
    try {
      const user = await getUser(auth)
      const query = Contact.query().where('id', params.id)
      if (!isAdminOrMonitor(user)) query.where('user_id', user.id)

      const contact = await query.firstOrFail()
      await contact.delete()

      return jsonResponse(response, 200, null, 'Contacto eliminado exitosamente')
    } catch {
      return jsonResponse(response, 404, null, 'Contacto no encontrado', false)
    }
  }
}
