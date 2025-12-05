import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run () {
    await User.createMany([
      {
        id: 1,
        name: 'Administrador',
        email: 'jesus_aranda_rodriguez@hotmail.com',
        password: 'Alicia544.',
        roleId: 1, // admin
      },
      {
        id: 2,
        name: 'Monitoreador',
        email: 'jesus_aranda_rdz@hotmail.com',
        password: 'Alicia544.',
        roleId: 2, // monitoreador
      },
      {
        id: 3,
        name: 'Usuario',
        email: 'jesusaranda5446373773@gmail.com',
        password: 'Alicia544.',
        roleId: 3, // usuario
      },
    ])
  }
}
