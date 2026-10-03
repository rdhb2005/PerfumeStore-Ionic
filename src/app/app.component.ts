import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CacheService, EstadoUsoCache } from './services/cache.service';
import { EstadoConexion, EstadoConexionService } from './services/estado-conexion.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  estadoRed: EstadoConexion = {
    tipo: 'comprobando',
    mensaje: 'Comprobando conexión...',
    ultimaComprobacion: null,
  };

  usoCache: EstadoUsoCache = {
    activo: false,
    recurso: '',
    guardadoEn: null,
  };

  private readonly suscripciones = new Subscription();

  constructor(
    private readonly estadoConexionService: EstadoConexionService,
    private readonly cacheService: CacheService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.suscripciones.add(
      this.estadoConexionService.estado$.subscribe((estado) => {
        this.estadoRed = estado;
        this.cdr.markForCheck();
      }),
    );

    this.suscripciones.add(
      this.cacheService.estadoUso$.subscribe((estado) => {
        this.usoCache = estado;
        this.cdr.markForCheck();
      }),
    );

    this.estadoConexionService.iniciarMonitoreo();
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
    this.estadoConexionService.detenerMonitoreo();
  }

  get mostrarAvisoConexion(): boolean {
    return this.usoCache.activo
      || this.estadoRed.tipo === 'sin-red'
      || this.estadoRed.tipo === 'servidor-no-disponible';
  }

  get tituloAviso(): string {
    if (this.usoCache.activo) return 'MODO CACHÉ';
    if (this.estadoRed.tipo === 'sin-red') return 'SIN CONEXIÓN';
    return 'SERVIDOR NO DISPONIBLE';
  }

  get mensajeAviso(): string {
    if (this.usoCache.activo) {
      const fecha = this.formatearFecha(this.usoCache.guardadoEn);
      return `Mostrando la última copia local de ${this.usoCache.recurso}${fecha ? ` · ${fecha}` : ''}.`;
    }

    if (this.estadoRed.tipo === 'sin-red') {
      return 'Las consultas utilizarán datos guardados cuando exista una copia local.';
    }

    return 'No se pudo contactar la API. Las consultas intentarán utilizar la caché local.';
  }

  async reintentarConexion(): Promise<void> {
    await this.estadoConexionService.verificarAhora();
  }

  private formatearFecha(valor: string | null): string {
    if (!valor) return '';

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return '';

    return fecha.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
