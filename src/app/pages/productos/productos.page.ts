import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  ActionSheetController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { FotoPerfumeVista, OrigenFotoPerfume } from '../../models/foto-perfume.model';
import { Perfume } from '../../models/perfume.model';
import { MultimediaService } from '../../services/multimedia.service';
import { PerfumeService } from '../../services/perfume.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonModal,
  ],
})
export class ProductosPage implements OnInit {
  perfumes: Perfume[] = [];
  fotos: Record<string, FotoPerfumeVista> = {};
  cargando = false;
  procesandoFotoId: number | null = null;
  mensajeCarga = '';
  mensajeEstado = '';
  tipoMensaje: 'exito' | 'error' | 'info' = 'info';

  fotoAmpliada: FotoPerfumeVista | null = null;
  perfumeAmpliado: Perfume | null = null;

  constructor(
    private readonly perfumeService: PerfumeService,
    private readonly multimediaService: MultimediaService,
    private readonly actionSheetController: ActionSheetController,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.cargarPerfumes();
  }

  async cargarPerfumes(): Promise<void> {
    try {
      await this.ejecutarSolicitud('Actualizando catálogo...', async () => {
        this.perfumes = await this.perfumeService.listar();
        this.fotos = await this.multimediaService.obtenerFotos(this.perfumes.map((perfume) => perfume.id));
      });
      this.mostrarEstado(`${this.perfumes.length} perfume(s) disponible(s).`, 'exito');
    } catch (error) {
      this.mostrarError(error);
    }
  }

  async agregarPerfume(): Promise<void> {
    const nombre = prompt('Nombre del perfume:');
    if (!nombre?.trim()) return;

    const marca = prompt('Marca del perfume:');
    if (!marca?.trim()) return;

    const tipo = prompt('Tipo de perfume:', 'Eau de Parfum');
    if (!tipo?.trim()) return;

    const precioTexto = prompt('Precio:');
    if (precioTexto === null) return;

    const stockTexto = prompt('Stock disponible:');
    if (stockTexto === null) return;

    const precio = Number(precioTexto);
    const stock = Number(stockTexto);

    if (Number.isNaN(precio) || Number.isNaN(stock) || precio < 0 || !Number.isInteger(stock) || stock < 0) {
      this.mostrarEstado('El precio y el stock deben ser valores válidos.', 'error');
      return;
    }

    try {
      await this.ejecutarSolicitud('Guardando perfume...', async () => {
        await this.perfumeService.crear({
          nombre: nombre.trim(),
          marca: marca.trim(),
          tipo: tipo.trim(),
          precio,
          stock,
        });
        this.perfumes = await this.perfumeService.listar();
        this.fotos = await this.multimediaService.obtenerFotos(this.perfumes.map((perfume) => perfume.id));
      });
      this.mostrarEstado('Perfume registrado correctamente.', 'exito');
    } catch (error) {
      this.mostrarError(error);
    }
  }

  async editarPerfume(perfume: Perfume): Promise<void> {
    const nombre = prompt('Nombre:', perfume.nombre);
    if (!nombre?.trim()) return;

    const marca = prompt('Marca:', perfume.marca);
    if (!marca?.trim()) return;

    const tipo = prompt('Tipo:', perfume.tipo);
    if (!tipo?.trim()) return;

    const precioTexto = prompt('Precio:', perfume.precio.toString());
    if (precioTexto === null) return;

    const stockTexto = prompt('Stock:', perfume.stock.toString());
    if (stockTexto === null) return;

    const precio = Number(precioTexto);
    const stock = Number(stockTexto);

    if (Number.isNaN(precio) || Number.isNaN(stock) || precio < 0 || !Number.isInteger(stock) || stock < 0) {
      this.mostrarEstado('El precio y el stock deben ser valores válidos.', 'error');
      return;
    }

    try {
      await this.ejecutarSolicitud('Actualizando perfume...', async () => {
        await this.perfumeService.actualizar(perfume.id, {
          nombre: nombre.trim(),
          marca: marca.trim(),
          tipo: tipo.trim(),
          precio,
          stock,
        });
        this.perfumes = await this.perfumeService.listar();
      });
      this.mostrarEstado(`${perfume.nombre} se actualizó correctamente.`, 'exito');
    } catch (error) {
      this.mostrarError(error);
    }
  }

  async eliminarPerfume(perfume: Perfume): Promise<void> {
    if (!confirm(`¿Eliminar ${perfume.nombre} de ${perfume.marca}?`)) return;

    try {
      await this.ejecutarSolicitud('Eliminando perfume...', async () => {
        await this.perfumeService.eliminar(perfume.id);
        await this.multimediaService.eliminarFoto(perfume.id);
        this.perfumes = await this.perfumeService.listar();
        delete this.fotos[String(perfume.id)];
      });
      this.mostrarEstado(`${perfume.nombre} se eliminó correctamente.`, 'exito');
    } catch (error) {
      this.mostrarError(error);
    }
  }

  fotoDe(perfume: Perfume): FotoPerfumeVista | null {
    return this.fotos[String(perfume.id)] ?? null;
  }

  async gestionarFoto(perfume: Perfume): Promise<void> {
    if (this.procesandoFotoId !== null) return;

    const tieneFoto = Boolean(this.fotoDe(perfume));
    const hoja = await this.actionSheetController.create({
      header: perfume.nombre,
      subHeader: 'Fotografía del perfume',
      cssClass: 'ps-media-sheet',
      buttons: [
        {
          text: 'Tomar fotografía',
          role: 'camara',
        },
        {
          text: 'Elegir de galería',
          role: 'galeria',
        },
        ...(tieneFoto
          ? [{
              text: 'Eliminar fotografía',
              role: 'eliminar',
            }]
          : []),
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });

    await hoja.present();
    const { role } = await hoja.onDidDismiss();

    if (role === 'camara') {
      await this.actualizarFoto(perfume, 'camara');
    } else if (role === 'galeria') {
      await this.actualizarFoto(perfume, 'galeria');
    } else if (role === 'eliminar') {
      await this.quitarFoto(perfume);
    }
  }

  abrirFoto(perfume: Perfume): void {
    const foto = this.fotoDe(perfume);
    if (!foto) return;

    this.fotoAmpliada = foto;
    this.perfumeAmpliado = perfume;
  }

  cerrarFoto(): void {
    this.fotoAmpliada = null;
    this.perfumeAmpliado = null;
  }

  formatearFechaFoto(valor: string | null): string {
    if (!valor) return 'No disponible';
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return 'No disponible';

    return fecha.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatearTamano(bytes: number | null): string {
    if (!bytes || bytes <= 0) return 'No disponible';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  textoOrigen(origen: OrigenFotoPerfume): string {
    return origen === 'camara' ? 'Cámara' : 'Galería';
  }

  private async actualizarFoto(perfume: Perfume, origen: OrigenFotoPerfume): Promise<void> {
    this.procesandoFotoId = perfume.id;
    this.mensajeEstado = '';
    this.cdr.markForCheck();

    try {
      const foto = origen === 'camara'
        ? await this.multimediaService.capturar(perfume.id)
        : await this.multimediaService.elegirDeGaleria(perfume.id);

      if (!foto) return;

      this.fotos = {
        ...this.fotos,
        [String(perfume.id)]: foto,
      };
      this.mostrarEstado(`Fotografía de ${perfume.nombre} guardada en el dispositivo.`, 'exito');
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.procesandoFotoId = null;
      this.cdr.markForCheck();
    }
  }

  private async quitarFoto(perfume: Perfume): Promise<void> {
    if (!confirm(`¿Eliminar la fotografía de ${perfume.nombre}?`)) return;

    this.procesandoFotoId = perfume.id;
    this.cdr.markForCheck();

    try {
      await this.multimediaService.eliminarFoto(perfume.id);
      const fotos = { ...this.fotos };
      delete fotos[String(perfume.id)];
      this.fotos = fotos;
      this.mostrarEstado('Fotografía eliminada del dispositivo.', 'exito');
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.procesandoFotoId = null;
      this.cdr.markForCheck();
    }
  }

  private async ejecutarSolicitud<T>(mensaje: string, operacion: () => Promise<T>): Promise<T> {
    this.cargando = true;
    this.mensajeCarga = mensaje;
    this.mensajeEstado = '';
    this.tipoMensaje = 'info';
    this.cdr.markForCheck();

    try {
      return await operacion();
    } finally {
      this.cargando = false;
      this.mensajeCarga = '';
      this.cdr.markForCheck();
    }
  }

  private mostrarError(error: unknown): void {
    this.mostrarEstado(this.mensajeError(error), 'error');
  }

  private mostrarEstado(mensaje: string, tipo: 'exito' | 'error' | 'info'): void {
    this.mensajeEstado = mensaje;
    this.tipoMensaje = tipo;
    this.cdr.markForCheck();
  }

  private mensajeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
  }
}
