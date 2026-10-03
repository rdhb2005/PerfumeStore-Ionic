import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConexionService } from './conexion.service';

export type TipoEstadoConexion =
  | 'sin-configurar'
  | 'comprobando'
  | 'conectado'
  | 'sin-red'
  | 'servidor-no-disponible';

export interface EstadoConexion {
  tipo: TipoEstadoConexion;
  mensaje: string;
  ultimaComprobacion: string | null;
}

/**
 * Supervisa la conectividad del dispositivo y comprueba periódicamente
 * si la API configurada continúa disponible.
 */
@Injectable({ providedIn: 'root' })
export class EstadoConexionService {
  private readonly estadoSubject = new BehaviorSubject<EstadoConexion>({
    tipo: 'comprobando',
    mensaje: 'Comprobando conexión...',
    ultimaComprobacion: null,
  });

  readonly estado$ = this.estadoSubject.asObservable();

  private iniciado = false;
  private intervalo: ReturnType<typeof setInterval> | null = null;
  private comprobando = false;

  private readonly escucharOnline = () => {
    void this.verificarAhora();
  };

  private readonly escucharOffline = () => {
    this.marcarSinRed();
  };

  constructor(private readonly conexionService: ConexionService) {}

  // Inicia la detección automática de cambios de red y disponibilidad del servidor.
  iniciarMonitoreo(): void {
    if (this.iniciado) return;
    this.iniciado = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.escucharOnline);
      window.addEventListener('offline', this.escucharOffline);
    }

    void this.verificarAhora();
    this.intervalo = setInterval(() => void this.verificarAhora(), 12000);
  }

  detenerMonitoreo(): void {
    if (!this.iniciado) return;
    this.iniciado = false;

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.escucharOnline);
      window.removeEventListener('offline', this.escucharOffline);
    }

    if (this.intervalo !== null) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  // Comprueba la red y después valida que el endpoint principal de la API responda.
  async verificarAhora(): Promise<void> {
    if (this.comprobando) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.marcarSinRed();
      return;
    }

    let apiUrl: string;
    try {
      apiUrl = await this.conexionService.obtenerApiUrl();
    } catch {
      this.actualizar('sin-configurar', 'Todavía no se ha configurado un servidor API.');
      return;
    }

    this.comprobando = true;

    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), 4500);

    try {
      const respuesta = await fetch(`${apiUrl}/index.php`, {
        method: 'GET',
        cache: 'no-store',
        signal: controlador.signal,
      });

      if (!respuesta.ok) {
        this.actualizar(
          'servidor-no-disponible',
          `El servidor respondió con el código ${respuesta.status}.`,
        );
        return;
      }

      this.reportarApiDisponible();
    } catch {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.marcarSinRed();
      } else {
        this.reportarApiNoDisponible('No se pudo contactar la API configurada.');
      }
    } finally {
      clearTimeout(temporizador);
      this.comprobando = false;
    }
  }

  // Se utiliza cuando una petición normal confirma que la API está respondiendo.
  reportarApiDisponible(): void {
    this.actualizar('conectado', 'Conexión con la API disponible.');
  }

  // Se utiliza cuando una petición no logra contactar al servidor.
  reportarApiNoDisponible(mensaje = 'El servidor no se encuentra disponible.'): void {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.marcarSinRed();
      return;
    }

    this.actualizar('servidor-no-disponible', mensaje);
  }

  private marcarSinRed(): void {
    this.actualizar('sin-red', 'No hay conexión de red disponible.');
  }

  private actualizar(tipo: TipoEstadoConexion, mensaje: string): void {
    this.estadoSubject.next({
      tipo,
      mensaje,
      ultimaComprobacion: new Date().toISOString(),
    });
  }
}
