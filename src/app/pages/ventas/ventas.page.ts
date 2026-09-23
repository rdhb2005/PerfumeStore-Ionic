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
  IonCardContent,
  IonButton,
  IonButtons,
  IonBackButton
} from '@ionic/angular';

import { Venta } from '../../models/venta.model';
import { Cliente } from '../../models/cliente.model';
import { Perfume } from '../../models/perfume.model';

import { VentaService } from '../../services/venta.service';
import { ClienteService } from '../../services/cliente.service';
import { PerfumeService } from '../../services/perfume.service';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.page.html',
  styleUrls: ['./ventas.page.scss'],
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
    IonCardContent,
    IonButton,
    IonButtons,
    IonBackButton
  ]
})
export class VentasPage {

  ventas: Venta[] = [];
  clientes: Cliente[] = [];
  perfumes: Perfume[] = [];

  constructor(
    private ventaService: VentaService,
    private clienteService: ClienteService,
    private perfumeService: PerfumeService
  ) {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.ventas = this.ventaService.listar();
    this.clientes = this.clienteService.listar();
    this.perfumes = this.perfumeService.listar();
  }

  obtenerCliente(clienteId: number): string {

    const cliente = this.clientes.find(
      c => c.id === clienteId
    );

    return cliente
      ? cliente.nombre
      : 'Cliente no encontrado';
  }

  obtenerPerfume(perfumeId: number): string {

    const perfume = this.perfumes.find(
      p => p.id === perfumeId
    );

    return perfume
      ? `${perfume.nombre} - ${perfume.marca}`
      : 'Perfume no encontrado';
  }

  agregarVenta(): void {

    if (this.clientes.length === 0) {
      alert('Primero debes registrar un cliente.');
      return;
    }

    const perfumesDisponibles =
      this.perfumes.filter(p => p.stock > 0);

    if (perfumesDisponibles.length === 0) {
      alert('No hay perfumes disponibles en stock.');
      return;
    }

    const listaClientes = this.clientes
      .map(c => `${c.id} - ${c.nombre}`)
      .join('\n');

    const clienteTexto = prompt(
      `Escribe el ID del cliente:\n\n${listaClientes}`
    );

    if (clienteTexto === null) {
      return;
    }

    const clienteId = Number(clienteTexto);

    const cliente = this.clientes.find(
      c => c.id === clienteId
    );

    if (!cliente) {
      alert('Cliente no válido.');
      return;
    }

    const listaPerfumes = perfumesDisponibles
      .map(
        p =>
          `${p.id} - ${p.nombre} - ${p.marca} - $${p.precio} - Stock: ${p.stock}`
      )
      .join('\n');

    const perfumeTexto = prompt(
      `Escribe el ID del perfume:\n\n${listaPerfumes}`
    );

    if (perfumeTexto === null) {
      return;
    }

    const perfumeId = Number(perfumeTexto);

    const perfume = perfumesDisponibles.find(
      p => p.id === perfumeId
    );

    if (!perfume) {
      alert('Perfume no válido.');
      return;
    }

    const cantidadTexto = prompt(
      `Cantidad a vender. Disponibles: ${perfume.stock}`,
      '1'
    );

    if (cantidadTexto === null) {
      return;
    }

    const cantidad = Number(cantidadTexto);

    if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0 ||
      cantidad > perfume.stock
    ) {
      alert('La cantidad no es válida.');
      return;
    }

    const fechaActual =
      new Date().toLocaleDateString('es-MX');

    const fecha = prompt(
      'Fecha de la venta:',
      fechaActual
    );

    if (!fecha || !fecha.trim()) {
      return;
    }

    this.ventaService.crear({
      clienteId,
      perfumeId,
      cantidad,
      precioUnitario: perfume.precio,
      fecha: fecha.trim()
    });

    this.perfumeService.actualizar(
      perfume.id,
      {
        stock: perfume.stock - cantidad
      }
    );

    this.cargarDatos();

    alert('Venta registrada correctamente.');
  }

  editarVenta(venta: Venta): void {

    const perfumeAnterior =
      this.perfumeService.obtener(venta.perfumeId);

    const listaClientes = this.clientes
      .map(c => `${c.id} - ${c.nombre}`)
      .join('\n');

    const clienteTexto = prompt(
      `ID del cliente:\n\n${listaClientes}`,
      venta.clienteId.toString()
    );

    if (clienteTexto === null) {
      return;
    }

    const clienteId = Number(clienteTexto);

    const cliente = this.clientes.find(
      c => c.id === clienteId
    );

    if (!cliente) {
      alert('Cliente no válido.');
      return;
    }

    const listaPerfumes = this.perfumes
      .map(
        p =>
          `${p.id} - ${p.nombre} - ${p.marca} - $${p.precio} - Stock: ${p.stock}`
      )
      .join('\n');

    const perfumeTexto = prompt(
      `ID del perfume:\n\n${listaPerfumes}`,
      venta.perfumeId.toString()
    );

    if (perfumeTexto === null) {
      return;
    }

    const perfumeId = Number(perfumeTexto);

    const perfumeNuevo = this.perfumes.find(
      p => p.id === perfumeId
    );

    if (!perfumeNuevo) {
      alert('Perfume no válido.');
      return;
    }

    let stockDisponible = perfumeNuevo.stock;

    if (perfumeAnterior?.id === perfumeNuevo.id) {
      stockDisponible += venta.cantidad;
    }

    const cantidadTexto = prompt(
      `Cantidad. Disponibles: ${stockDisponible}`,
      venta.cantidad.toString()
    );

    if (cantidadTexto === null) {
      return;
    }

    const cantidad = Number(cantidadTexto);

    if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0 ||
      cantidad > stockDisponible
    ) {
      alert('La cantidad no es válida.');
      return;
    }

    const fecha = prompt(
      'Fecha:',
      venta.fecha
    );

    if (!fecha || !fecha.trim()) {
      return;
    }

    if (perfumeAnterior) {
      this.perfumeService.actualizar(
        perfumeAnterior.id,
        {
          stock:
            perfumeAnterior.stock +
            venta.cantidad
        }
      );
    }

    const perfumeActualizado =
      this.perfumeService.obtener(perfumeNuevo.id);

    if (!perfumeActualizado) {
      return;
    }

    this.perfumeService.actualizar(
      perfumeActualizado.id,
      {
        stock:
          perfumeActualizado.stock -
          cantidad
      }
    );

    this.ventaService.actualizar(
      venta.id,
      {
        clienteId,
        perfumeId,
        cantidad,
        precioUnitario: perfumeNuevo.precio,
        fecha: fecha.trim()
      }
    );

    this.cargarDatos();

    alert('Venta actualizada correctamente.');
  }

  eliminarVenta(venta: Venta): void {

    const confirmar = confirm(
      `¿Eliminar la venta #${venta.id}?`
    );

    if (!confirmar) {
      return;
    }

    const perfume =
      this.perfumeService.obtener(venta.perfumeId);

    if (perfume) {
      this.perfumeService.actualizar(
        perfume.id,
        {
          stock:
            perfume.stock +
            venta.cantidad
        }
      );
    }

    this.ventaService.eliminar(venta.id);

    this.cargarDatos();

    alert('Venta eliminada.');
  }
}