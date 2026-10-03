import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/angular';
import { ConexionService } from '../services/conexion.service';
import { EstadoConexionService, TipoEstadoConexion } from '../services/estado-conexion.service';

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
    RouterLink
  ],
})
export class HomePage implements OnInit, OnDestroy {
  servidor = '';
  estadoTipo: TipoEstadoConexion = 'comprobando';
  estadoTexto = 'COMPROBANDO';

  private readonly suscripciones = new Subscription();

  constructor(
    private readonly conexionService: ConexionService,
    private readonly estadoConexionService: EstadoConexionService,
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

    this.servidor = await this.conexionService.obtenerServidor();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
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
