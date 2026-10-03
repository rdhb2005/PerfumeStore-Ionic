import { Injectable, inject } from '@angular/core';
import { ConexionService } from './conexion.service';
import { EstadoConexionService } from './estado-conexion.service';
/*
Este archivo se encarga de comunicar la aplicación Ionic con la API PHP.
Aquí se hacen las peticiones GET, POST, PATCH y DELETE.
*/
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
 * La dirección base se obtiene desde el dato capturado en la pantalla de conexión.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly conexion = inject(ConexionService);
  private readonly estadoConexion = inject(EstadoConexionService);
  private readonly tiempoEsperaMs = 4500;

  // Este método consulta información de la API.
  get<T>(archivo: string, params?: Parametros): Promise<T> {
    return this.enviar<T>('GET', archivo, undefined, params);
  }

  // Este método envía información nueva a la API.
  post<T>(archivo: string, datos: unknown): Promise<T> {
    return this.enviar<T>('POST', archivo, datos);
  }

  // Este método actualiza información existente.
  patch<T>(archivo: string, datos: unknown, params?: Parametros): Promise<T> {
    return this.enviar<T>('PATCH', archivo, datos, params);
  }

  // Este método elimina información mediante la API.
  delete<T = null>(archivo: string, params?: Parametros): Promise<T> {
    return this.enviar<T>('DELETE', archivo, undefined, params);
  }

  // Este método arma la petición usando la IP guardada y revisa la respuesta del servidor.
  private async enviar<T>(
    metodo: string,
    archivo: string,
    datos?: unknown,
    params?: Parametros,
  ): Promise<T> {
    let baseUrl: string;

    try {
      baseUrl = await this.conexion.obtenerApiUrl();
    } catch (error) {
      throw new ApiError(error instanceof Error ? error.message : 'No se definió el servidor.', 0);
    }

    const ruta = archivo.startsWith('/') ? archivo.slice(1) : archivo;
    const url = new URL(`${baseUrl}/${ruta}`);

    for (const [clave, valor] of Object.entries(params ?? {})) {
      url.searchParams.set(clave, String(valor));
    }

    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), this.tiempoEsperaMs);
    let respuesta: Response;

    try {
      respuesta = await fetch(url.toString(), {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: datos === undefined ? undefined : JSON.stringify(datos),
        signal: controlador.signal,
      });
      this.estadoConexion.reportarApiDisponible();
    } catch (error) {
      const sinRed = typeof navigator !== 'undefined' && !navigator.onLine;
      const tiempoAgotado = error instanceof DOMException && error.name === 'AbortError';

      const esConsulta = metodo === 'GET';
      const mensaje = sinRed
        ? esConsulta
          ? 'No hay conexión de red. Se intentará mostrar la última copia local disponible.'
          : 'No hay conexión de red. Esta operación necesita conexión con el servidor y no se guardó en MySQL.'
        : tiempoAgotado
          ? esConsulta
            ? 'El servidor tardó demasiado en responder. Se intentará usar la caché local.'
            : 'El servidor tardó demasiado en responder. La operación no se guardó en MySQL.'
          : esConsulta
            ? 'No se pudo contactar con el servidor. Se intentará usar la caché local.'
            : 'No se pudo contactar con el servidor. Esta operación no se guardó en MySQL.';

      this.estadoConexion.reportarApiNoDisponible(mensaje);
      throw new ApiError(mensaje, 0);
    } finally {
      clearTimeout(temporizador);
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
