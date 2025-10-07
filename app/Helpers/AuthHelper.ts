import type { AuthContract } from '@ioc:Adonis/Addons/Auth'
/**
 * Obtener el usuario autenticado
 */
export async function getUser(auth: AuthContract) {
  const  user  = await auth.use('api').authenticate()
  return user
}

/**
 * Verificar si el usuario es admin o monitoreador
 */
export function isAdminOrMonitor(user: { roleId: number }) {
  return user.roleId === 1 || user.roleId === 2
}
