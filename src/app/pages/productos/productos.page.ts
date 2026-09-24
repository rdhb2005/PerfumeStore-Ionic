import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
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
} from '@ionic/angular';

import { Perfume } from '../../models/perfume.model';
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
  ],
})
export class ProductosPage implements OnInit {
  perfumes: Perfume[] = [];

  constructor(
    private readonly perfumeService: PerfumeService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.cargarPerfumes();
  }

  async cargarPerfumes(): Promise<void> {
    try {
      this.perfumes = await this.perfumeService.listar();
      this.cdr.markForCheck();
    } catch (error) {
      alert(this.mensajeError(error));
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
      alert('El precio y el stock deben ser valores válidos.');
      return;
    }

    try {
      await this.perfumeService.crear({
        nombre: nombre.trim(),
        marca: marca.trim(),
        tipo: tipo.trim(),
        precio,
        stock,
      });
      await this.cargarPerfumes();
      alert('Perfume registrado en MySQL.');
    } catch (error) {
      alert(this.mensajeError(error));
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
      alert('El precio y el stock deben ser valores válidos.');
      return;
    }

    try {
      await this.perfumeService.actualizar(perfume.id, {
        nombre: nombre.trim(),
        marca: marca.trim(),
        tipo: tipo.trim(),
        precio,
        stock,
      });
      await this.cargarPerfumes();
      alert('Perfume actualizado.');
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  async eliminarPerfume(perfume: Perfume): Promise<void> {
    if (!confirm(`¿Eliminar ${perfume.nombre} de ${perfume.marca}?`)) return;

    try {
      await this.perfumeService.eliminar(perfume.id);
      await this.cargarPerfumes();
      alert('Perfume eliminado.');
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  private mensajeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
  }
}
