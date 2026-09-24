import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

interface RespuestaApi<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
}

type Parametros = Record<string, string | number | boolean>;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errores: Record<string, string> = {},
  ) {
    super(message);
  }
}

/**
 * Cliente HTTP sencillo para la API PHP de PerfumeStore.
 * Centraliza GET, POST, PATCH y DELETE para no repetir fetch en cada servicio.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  get<T>(archivo: string, params?: Parametros): Promise<T> {
    return this.enviar<T>('GET', archivo, undefined, params);
  }

  post<T>(archivo: string, datos: unknown): Promise<T> {
    return this.enviar<T>('POST', archivo, datos);
  }

  patch<T>(archivo: string, datos: unknown, params?: Parametros): Promise<T> {
    return this.enviar<T>('PATCH', archivo, datos, params);
  }

  delete<T = null>(archivo: string, params?: Parametros): Promise<T> {
    return this.enviar<T>('DELETE', archivo, undefined, params);
  }

  private async enviar<T>(
    metodo: string,
    archivo: string,
    datos?: unknown,
    params?: Parametros,
  ): Promise<T> {
    const ruta = archivo.startsWith('/') ? archivo.slice(1) : archivo;
    const url = new URL(`${this.baseUrl}/${ruta}`);

    for (const [clave, valor] of Object.entries(params ?? {})) {
      url.searchParams.set(clave, String(valor));
    }

    let respuesta: Response;

    try {
      respuesta = await fetch(url.toString(), {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: datos === undefined ? undefined : JSON.stringify(datos),
      });
    } catch {
      throw new ApiError(
        'No se pudo conectar con el servidor. Verifica que Apache y MySQL estén encendidos en XAMPP.',
        0,
      );
    }

    let cuerpo: RespuestaApi<T>;

    try {
      cuerpo = (await respuesta.json()) as RespuestaApi<T>;
    } catch {
      throw new ApiError('El servidor devolvió una respuesta no válida.', respuesta.status);
    }

    if (!respuesta.ok || !cuerpo.success) {
      throw new ApiError(
        cuerpo.message || `Error del servidor (${respuesta.status}).`,
        respuesta.status,
        cuerpo.errors,
      );
    }

    return cuerpo.data;
  }
}
