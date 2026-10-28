import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonSpinner
} from '@ionic/angular';
import { ConexionService } from '../services/conexion.service';
import { EstadoConexionService, TipoEstadoConexion } from '../services/estado-conexion.service';
import { EstadoSincronizacion, SincronizacionService } from '../services/sincronizacion.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonSpinner,
    RouterLink
  ],
})
export class HomePage implements OnInit, OnDestroy {
  servidor = '';
  estadoTipo: TipoEstadoConexion = 'comprobando';
  estadoTexto = 'COMPROBANDO';
  estadoSincronizacion: EstadoSincronizacion = {
    tipo: 'pendiente',
    mensaje: 'Esperando conexión para sincronizar.',
    ultimaSincronizacion: null,
  };

  private readonly suscripciones = new Subscription();

  constructor(
    private readonly conexionService: ConexionService,
    private readonly estadoConexionService: EstadoConexionService,
    private readonly sincronizacionService: SincronizacionService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.suscripciones.add(
      this.estadoConexionService.estado$.subscribe((estado) => {
        this.estadoTipo = estado.tipo;
        this.estadoTexto = this.textoEstado(estado.tipo);
        this.cdr.markForCheck();
      }),
    );

    this.suscripciones.add(
      this.sincronizacionService.estado$.subscribe((estado) => {
        this.estadoSincronizacion = estado;
        this.cdr.markForCheck();
      }),
    );

    this.servidor = await this.conexionService.obtenerServidor();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  async sincronizarAhora(): Promise<void> {
    await this.estadoConexionService.verificarAhora();
    await this.sincronizacionService.sincronizar();
  }

  get sincronizando(): boolean {
    return this.estadoSincronizacion.tipo === 'sincronizando';
  }

  get textoSincronizacion(): string {
    switch (this.estadoSincronizacion.tipo) {
      case 'sincronizando':
        return 'SINCRONIZANDO';
      case 'sincronizado':
        return 'SINCRONIZADO';
      case 'sin-conexion':
        return 'MODO LOCAL';
      case 'error':
        return 'ERROR DE SINCRONIZACIÓN';
      default:
        return 'PENDIENTE';
    }
  }

  get ultimaSincronizacionTexto(): string {
    const valor = this.estadoSincronizacion.ultimaSincronizacion;
    if (!valor) return 'Todavía no se ha completado una sincronización.';

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return 'Fecha de sincronización no disponible.';

    return `Última sincronización: ${fecha.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  private textoEstado(tipo: TipoEstadoConexion): string {
    switch (tipo) {
      case 'conectado':
        return 'EN LÍNEA';
      case 'sin-red':
        return 'SIN RED';
      case 'servidor-no-disponible':
        return 'API NO DISPONIBLE';
      case 'sin-configurar':
        return 'SIN CONFIGURAR';
      default:
        return 'COMPROBANDO';
    }
  }
}
