import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

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
  IonBackButton
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
    IonBackButton
  ]
})
export class ProductosPage {

  perfumes: Perfume[] = [];

  constructor(
    private perfumeService: PerfumeService
  ) {
    this.cargarPerfumes();
  }

  cargarPerfumes(): void {
    this.perfumes = this.perfumeService.listar();
  }

  agregarPerfume(): void {

    const nombre = prompt('Nombre del perfume:');

    if (!nombre || !nombre.trim()) {
      return;
    }

    const marca = prompt('Marca del perfume:');

    if (!marca || !marca.trim()) {
      return;
    }

    const tipo = prompt(
      'Tipo de perfume:',
      'Eau de Parfum'
    );

    if (!tipo || !tipo.trim()) {
      return;
    }

    const precioTexto = prompt('Precio:');

    if (precioTexto === null) {
      return;
    }

    const stockTexto = prompt('Stock disponible:');

    if (stockTexto === null) {
      return;
    }

    const precio = Number(precioTexto);
    const stock = Number(stockTexto);

    if (
      Number.isNaN(precio) ||
      Number.isNaN(stock) ||
      precio < 0 ||
      stock < 0
    ) {
      alert('El precio y el stock deben ser valores válidos.');
      return;
    }

    this.perfumeService.crear({
      nombre: nombre.trim(),
      marca: marca.trim(),
      tipo: tipo.trim(),
      precio,
      stock
    });

    this.cargarPerfumes();
  }

  editarPerfume(perfume: Perfume): void {

    const nombre = prompt(
      'Nombre:',
      perfume.nombre
    );

    if (nombre === null || !nombre.trim()) {
      return;
    }

    const marca = prompt(
      'Marca:',
      perfume.marca
    );

    if (marca === null || !marca.trim()) {
      return;
    }

    const tipo = prompt(
      'Tipo:',
      perfume.tipo
    );

    if (tipo === null || !tipo.trim()) {
      return;
    }

    const precioTexto = prompt(
      'Precio:',
      perfume.precio.toString()
    );

    if (precioTexto === null) {
      return;
    }

    const stockTexto = prompt(
      'Stock:',
      perfume.stock.toString()
    );

    if (stockTexto === null) {
      return;
    }

    const precio = Number(precioTexto);
    const stock = Number(stockTexto);

    if (
      Number.isNaN(precio) ||
      Number.isNaN(stock) ||
      precio < 0 ||
      stock < 0
    ) {
      alert('El precio y el stock deben ser valores válidos.');
      return;
    }

    this.perfumeService.actualizar(
      perfume.id,
      {
        nombre: nombre.trim(),
        marca: marca.trim(),
        tipo: tipo.trim(),
        precio,
        stock
      }
    );

    this.cargarPerfumes();
  }

  eliminarPerfume(perfume: Perfume): void {

    const confirmar = confirm(
      `¿Eliminar ${perfume.nombre} de ${perfume.marca}?`
    );

    if (!confirmar) {
      return;
    }

    this.perfumeService.eliminar(perfume.id);

    this.cargarPerfumes();
  }
}