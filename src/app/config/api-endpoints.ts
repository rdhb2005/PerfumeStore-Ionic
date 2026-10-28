/**
 * Catálogo central de endpoints de PerfumeStore.
 *
 * Mantener las rutas en un solo archivo ayuda a que los servicios Angular no
 * repitan cadenas y deja visible la arquitectura Cliente -> API.
 */
export const API_ENDPOINTS = {
  estado: 'index.php',
  login: 'login.php',
  perfumes: 'perfumes.php',
  clientes: 'clientes.php',
  ventas: 'ventas.php',
} as const;

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
export type MetodoHttp = 'GET' | 'POST' | 'PATCH' | 'DELETE';
