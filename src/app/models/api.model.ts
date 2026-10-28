/**
 * Formato general utilizado por la API PHP para responder al cliente Ionic.
 */
export interface RespuestaApi<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
}

/** Datos que el cliente envía al endpoint login.php. */
export interface LoginSolicitud {
  usuario: string;
  contrasena: string;
}

/** Respuesta mínima esperada durante la autenticación y la prueba de conexión. */
export interface RespuestaEstadoApi {
  success?: boolean;
  message?: string;
}
