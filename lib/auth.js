// Vérifie le mot de passe admin côté serveur
export function checkAdminPassword(password) {
  return password === process.env.ADMIN_PASSWORD
}

// Vérifie le header Authorization dans les API routes
export function isAuthorized(request) {
  const auth = request.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) return false
  const token = auth.replace('Bearer ', '')
  return token === process.env.ADMIN_PASSWORD
}
