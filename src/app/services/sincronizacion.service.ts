import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AlmacenamientoService } from './almacenamiento.service';
import { CacheService } from './cache.service';
import { ClienteService } from './cliente.service';
import { EstadoConexionService, TipoEstadoConexion } from './estado-conexion.service';
import { PerfumeService } from './perfume.service';
import { VentaService } from './venta.service';

export type TipoEstadoSincronizacion =
  | 'pendiente'
  | 'sincronizando'
  | 'sincronizado'
  | 'sin-conexion'
  | 'error';

export interface EstadoSincronizacion {
  tipo: TipoEstadoSincronizacion;
  mensaje: string;
  ultimaSincronizacion: string | null;
}

/**
 * Coordina la sincronización entre la información remota de la API y la copia
 * local guardada con Capacitor Preferences.
 *
 * Estrategia:
 * - Con conexión: consulta la API y reemplaza las copias locales.
 * - Sin conexión: los servicios de cada módulo utilizan la última caché válida.
 * - Al recuperar conexión: sincroniza automáticamente perfumes, clientes y ventas.
 */
@Injectable({ providedIn: 'root' })
export class SincronizacionService {
  private readonly claveUltimaSincronizacion = 'perfumestore_ultima_sincronizacion';

  private readonly estadoSubject = new BehaviorSubject<EstadoSincronizacion>({
    tipo: 'pendiente',
    mensaje: 'Esperando conexión para sincronizar.',
    ultimaSincronizacion: null,
  });

  readonly estado$ = this.estadoSubject.asObservable();

  private iniciado = false;
  private suscripcionConexion: Subscription | null = null;
  private estadoConexionAnterior: TipoEstadoConexion | null = null;
  private sincronizacionActiva: Promise<void> | null = null;

  constructor(
    private readonly almacenamiento: AlmacenamientoService,
    private readonly cacheService: CacheService,
    private readonly estadoConexion: EstadoConexionService,
    private readonly perfumeService: PerfumeService,
    private readonly clienteService: ClienteService,
    private readonly ventaService: VentaService,
  ) {}

  iniciar(): void {
    if (this.iniciado) return;
    this.iniciado = true;

    void this.cargarUltimaSincronizacion();

    this.suscripcionConexion = this.estadoConexion.estado$.subscribe((estado) => {
      const anterior = this.estadoConexionAnterior;
      this.estadoConexionAnterior = estado.tipo;

      if (estado.tipo === 'conectado') {
        // Se sincroniza al iniciar con conexión y también cuando la conexión se recupera.
        if (anterior !== 'conectado') {
          void this.sincronizar();
        }
        return;
      }

      if (estado.tipo === 'sin-red' || estado.tipo === 'servidor-no-disponible') {
        this.actualizarEstado(
          'sin-conexion',
          'Sin conexión remota. La aplicación utilizará la última información guardada localmente.',
        );
      }
    });
  }

  detener(): void {
    this.suscripcionConexion?.unsubscribe();
    this.suscripcionConexion = null;
    this.iniciado = false;
    this.estadoConexionAnterior = null;
  }

  /** Fuerza una sincronización manual de perfumes, clientes y ventas. */
  sincronizar(): Promise<void> {
    if (this.sincronizacionActiva) return this.sincronizacionActiva;

    this.sincronizacionActiva = this.ejecutarSincronizacion().finally(() => {
      this.sincronizacionActiva = null;
    });

    return this.sincronizacionActiva;
  }

  private async ejecutarSincronizacion(): Promise<void> {
    const conexion = this.estadoConexion.estadoActual;

    if (conexion.tipo !== 'conectado') {
      this.actualizarEstado(
        'sin-conexion',
        'No se puede sincronizar ahora. Se conservará la última copia local disponible.',
      );
      return;
    }

    this.actualizarEstado('sincronizando', 'Actualizando información local desde el servidor...');

    try {
      await Promise.all([
        this.perfumeService.sincronizarDesdeServidor(),
        this.clienteService.sincronizarDesdeServidor(),
        this.ventaService.sincronizarDesdeServidor(),
      ]);

      const fecha = new Date().toISOString();
      await this.almacenamiento.guardar(this.claveUltimaSincronizacion, fecha);

      // Solo después de actualizar TODOS los recursos se abandona el modo local.
      // Esto evita que el banner desaparezca apenas vuelve Apache, antes de terminar
      // la recuperación real de la información remota.
      await this.cacheService.confirmarSincronizacionRemota();

      this.estadoSubject.next({
        tipo: 'sincronizado',
        mensaje: 'La información local está sincronizada con el servidor.',
        ultimaSincronizacion: fecha,
      });
    } catch (error) {
      const mensaje = error instanceof Error
        ? error.message
        : 'No fue posible completar la sincronización.';

      const tipoConexion = this.estadoConexion.estadoActual.tipo;
      this.actualizarEstado(
        tipoConexion === 'sin-red' || tipoConexion === 'servidor-no-disponible' ? 'sin-conexion' : 'error',
        mensaje,
      );
    }
  }

  private async cargarUltimaSincronizacion(): Promise<void> {
    const fecha = await this.almacenamiento.leer<string | null>(
      this.claveUltimaSincronizacion,
      null,
    );

    if (!fecha) return;

    const actual = this.estadoSubject.value;
    this.estadoSubject.next({ ...actual, ultimaSincronizacion: fecha });
  }

  private actualizarEstado(tipo: TipoEstadoSincronizacion, mensaje: string): void {
    const actual = this.estadoSubject.value;
    this.estadoSubject.next({
      tipo,
      mensaje,
      ultimaSincronizacion: actual.ultimaSincronizacion,
    });
  }
}
