import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlmacenamientoService } from './almacenamiento.service';

interface EntradaCache<T> {
  datos: T;
  guardadoEn: string;
}

export interface EstadoUsoCache {
  activo: boolean;
  recurso: string;
  guardadoEn: string | null;
}

/**
 * Mantiene una copia local de las consultas principales.
 *
 * El estado de modo local también se guarda en Preferences para que no se pierda
 * cuando Apache vuelve, se recarga la app o se cambia de pantalla. El modo local
 * solo se desactiva cuando SincronizacionService confirma que TODOS los recursos
 * remotos se actualizaron correctamente.
 */
@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly prefijo = 'perfumestore_cache_';
  private readonly claveEstado = 'perfumestore_estado_modo_local';

  private readonly estadoUsoSubject = new BehaviorSubject<EstadoUsoCache>({
    activo: false,
    recurso: '',
    guardadoEn: null,
  });

  readonly estadoUso$ = this.estadoUsoSubject.asObservable();

  constructor(private readonly almacenamiento: AlmacenamientoService) {
    void this.restaurarEstadoModoLocal();
  }

  /** Guarda la última respuesta válida de un recurso. */
  async guardar<T>(recurso: string, datos: T): Promise<void> {
    const entrada: EntradaCache<T> = {
      datos,
      guardadoEn: new Date().toISOString(),
    };

    await this.almacenamiento.guardar(this.clave(recurso), entrada);
  }

  /** Recupera la copia local de un recurso cuando existe. */
  async leer<T>(recurso: string): Promise<EntradaCache<T> | null> {
    return this.almacenamiento.leer<EntradaCache<T> | null>(this.clave(recurso), null);
  }

  /**
   * Consulta obligatoriamente el servidor y reemplaza la copia local.
   * No desactiva el modo local por sí sola: la sincronización completa es la que
   * confirma el regreso a datos remotos para evitar salir del modo local antes de tiempo.
   */
  async actualizarDesdeRemoto<T>(recurso: string, consultaRemota: () => Promise<T>): Promise<T> {
    const datos = await consultaRemota();
    await this.guardar(recurso, datos);
    return datos;
  }

  /** Primero intenta la API y, si falla, devuelve la última copia local disponible. */
  async obtenerConRespaldo<T>(recurso: string, consultaRemota: () => Promise<T>): Promise<T> {
    try {
      const datos = await consultaRemota();

      try {
        await this.guardar(recurso, datos);
      } catch {
        // La respuesta remota sigue siendo utilizable aunque Preferences falle.
      }

      // Si el modo local ya estaba activo, se conserva hasta que termine la
      // sincronización global de perfumes, clientes y ventas.
      return datos;
    } catch (error) {
      let entrada: EntradaCache<T> | null = null;

      try {
        entrada = await this.leer<T>(recurso);
      } catch {
        // Si Preferences también falla, se conserva el error original de la consulta.
      }

      if (entrada !== null) {
        await this.activarModoLocal({
          activo: true,
          recurso,
          guardadoEn: entrada.guardadoEn,
        });
        return entrada.datos;
      }

      const mensajeOriginal = error instanceof Error
        ? error.message
        : 'No fue posible consultar el servidor.';

      throw new Error(`${mensajeOriginal} No existe una copia local de ${recurso} en este dispositivo.`);
    }
  }

  /**
   * Se llama únicamente después de una sincronización remota completa y exitosa.
   * Aquí sí se elimina de forma persistente el indicador de modo local.
   */
  async confirmarSincronizacionRemota(): Promise<void> {
    const estado: EstadoUsoCache = { activo: false, recurso: '', guardadoEn: null };
    this.estadoUsoSubject.next(estado);

    try {
      await this.almacenamiento.eliminar(this.claveEstado);
    } catch {
      // El estado visual actual ya quedó en remoto; no se bloquea la app si Preferences falla.
    }
  }

  private async activarModoLocal(estado: EstadoUsoCache): Promise<void> {
    this.estadoUsoSubject.next(estado);

    try {
      await this.almacenamiento.guardar(this.claveEstado, estado);
    } catch {
      // El modo local funciona en memoria aunque no pueda persistirse el indicador.
    }
  }

  private async restaurarEstadoModoLocal(): Promise<void> {
    try {
      const estado = await this.almacenamiento.leer<EstadoUsoCache | null>(this.claveEstado, null);
      if (estado?.activo) {
        this.estadoUsoSubject.next(estado);
      }
    } catch {
      // No se interrumpe el arranque de la aplicación por un fallo de Preferences.
    }
  }

  private clave(recurso: string): string {
    return `${this.prefijo}${recurso}`;
  }
}
