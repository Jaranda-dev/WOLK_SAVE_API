import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Contact from 'App/Models/Contact'
import CreateContactValidator from 'App/Validators/Contacts/CreateContactValidator'
import UpdateContactValidator from 'App/Validators/Contacts/UpdateContactValidator'

export default class ContactsController {
  // Obtener todos los contactos
  public async index({ response }: HttpContextContract) {
    try {
      const contacts = await Contact.query().preload('user')
      return response.status(200).json({
        data: contacts,
        msg: 'Contactos obtenidos exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(500).json({
        data: null,
        msg: e.message || 'Error al obtener contactos',
        status: 'failed',
      })
    }
  }

  // Guardar un nuevo contacto
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(CreateContactValidator)
      const contact = await Contact.create(data)
      return response.status(201).json({
        data: contact,
        msg: 'Contacto creado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al crear contacto',
        status: 'failed',
      })
    }
  }

  // Mostrar un contacto específico
  public async show({ params, response }: HttpContextContract) {
    try {
      const contact = await Contact.query().where('id', params.id).preload('user').firstOrFail()
      return response.status(200).json({
        data: contact,
        msg: 'Contacto obtenido exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Contacto no encontrado',
        status: 'failed',
      })
    }
  }

  // Actualizar un contacto existente
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = await request.validate(UpdateContactValidator)
      const contact = await Contact.findOrFail(params.id)
      contact.merge(data)
      await contact.save()
      return response.status(200).json({
        data: contact,
        msg: 'Contacto actualizado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(400).json({
        data: null,
        msg: e.messages || e.message || 'Error al actualizar contacto',
        status: 'failed',
      })
    }
  }

  // Eliminar un contacto
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const contact = await Contact.findOrFail(params.id)
      await contact.delete()
      return response.status(200).json({
        data: null,
        msg: 'Contacto eliminado exitosamente',
        status: 'success',
      })
    } catch (e) {
      return response.status(404).json({
        data: null,
        msg: 'Contacto no encontrado',
        status: 'failed',
      })
    }
  }
}
