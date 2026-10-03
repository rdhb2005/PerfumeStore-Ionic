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
 * Guarda copias temporales de las consultas principales para poder mostrarlas
 * cuando la API no se encuentra disponible.
 */
@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly prefijo = 'perfumestore_cache_';
  private readonly estadoUsoSubject = new BehaviorSubject<EstadoUsoCache>({
    activo: false,
    recurso: '',
    guardadoEn: null,
  });

  readonly estadoUso$ = this.estadoUsoSubject.asObservable();

  constructor(private readonly almacenamiento: AlmacenamientoService) {}

  // Guarda la última respuesta válida de un recurso.
  async guardar<T>(recurso: string, datos: T): Promise<void> {
    const entrada: EntradaCache<T> = {
      datos,
      guardadoEn: new Date().toISOString(),
    };

    await this.almacenamiento.guardar(this.clave(recurso), entrada);
  }

  // Recupera la copia local de un recurso cuando existe.
  async leer<T>(recurso: string): Promise<EntradaCache<T> | null> {
    return this.almacenamiento.leer<EntradaCache<T> | null>(this.clave(recurso), null);
  }

  // Primero intenta consultar la API y, si falla, devuelve la última copia local.
  async obtenerConRespaldo<T>(recurso: string, consultaRemota: () => Promise<T>): Promise<T> {
    let datos: T;

    try {
      datos = await consultaRemota();
    } catch (error) {
      let entrada: EntradaCache<T> | null = null;

      try {
        entrada = await this.leer<T>(recurso);
      } catch {
        // Si Preferences también falla, se conserva el error original de la consulta.
      }

      if (entrada !== null) {
        this.estadoUsoSubject.next({
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

    try {
      await this.guardar(recurso, datos);
    } catch {
      // La aplicación sigue mostrando la respuesta remota aunque no se pueda actualizar la caché.
    }

    if (this.estadoUsoSubject.value.recurso === recurso) {
      this.desactivarModoCache();
    }

    return datos;
  }

  // Permite limpiar el indicador cuando la información vuelve a venir de la API.
  desactivarModoCache(): void {
    this.estadoUsoSubject.next({ activo: false, recurso: '', guardadoEn: null });
  }

  private clave(recurso: string): string {
    return `${this.prefijo}${recurso}`;
  }
}
