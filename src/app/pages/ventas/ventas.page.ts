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
  IonCardContent,
  IonButton,
  IonButtons,
  IonBackButton,
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
    IonBackButton,
  ],
})
export class VentasPage implements OnInit {
  ventas: Venta[] = [];
  clientes: Cliente[] = [];
  perfumes: Perfume[] = [];

  constructor(
    private readonly ventaService: VentaService,
    private readonly clienteService: ClienteService,
    private readonly perfumeService: PerfumeService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    try {
      const [ventas, clientes, perfumes] = await Promise.all([
        this.ventaService.listar(),
        this.clienteService.listar(),
        this.perfumeService.listar(),
      ]);
      this.ventas = ventas;
      this.clientes = clientes;
      this.perfumes = perfumes;
      this.cdr.markForCheck();
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  obtenerCliente(clienteId: number): string {
    return this.clientes.find((cliente) => cliente.id === clienteId)?.nombre ?? 'Cliente no encontrado';
  }

  obtenerPerfume(perfumeId: number): string {
    const perfume = this.perfumes.find((item) => item.id === perfumeId);
    return perfume ? `${perfume.nombre} - ${perfume.marca}` : 'Perfume no encontrado';
  }

  async agregarVenta(): Promise<void> {
    if (this.clientes.length === 0) {
      alert('Primero debes registrar un cliente.');
      return;
    }

    const perfumesDisponibles = this.perfumes.filter((perfume) => perfume.stock > 0);
    if (perfumesDisponibles.length === 0) {
      alert('No hay perfumes disponibles en stock.');
      return;
    }

    const listaClientes = this.clientes.map((cliente) => `${cliente.id} - ${cliente.nombre}`).join('\n');
    const clienteTexto = prompt(`Escribe el ID del cliente:\n\n${listaClientes}`);
    if (clienteTexto === null) return;

    const clienteId = Number(clienteTexto);
    if (!this.clientes.some((cliente) => cliente.id === clienteId)) {
      alert('Cliente no válido.');
      return;
    }

    const listaPerfumes = perfumesDisponibles
      .map((perfume) => `${perfume.id} - ${perfume.nombre} - ${perfume.marca} - $${perfume.precio} - Stock: ${perfume.stock}`)
      .join('\n');
    const perfumeTexto = prompt(`Escribe el ID del perfume:\n\n${listaPerfumes}`);
    if (perfumeTexto === null) return;

    const perfumeId = Number(perfumeTexto);
    const perfume = perfumesDisponibles.find((item) => item.id === perfumeId);
    if (!perfume) {
      alert('Perfume no válido.');
      return;
    }

    const cantidadTexto = prompt(`Cantidad a vender. Disponibles: ${perfume.stock}`, '1');
    if (cantidadTexto === null) return;

    const cantidad = Number(cantidadTexto);
    if (!Number.isInteger(cantidad) || cantidad <= 0 || cantidad > perfume.stock) {
      alert('La cantidad no es válida.');
      return;
    }

    const fecha = prompt('Fecha de la venta:', this.fechaHoy());
    if (!fecha?.trim()) return;

    try {
      await this.ventaService.crear({ clienteId, perfumeId, cantidad, fecha: fecha.trim() });
      await this.cargarDatos();
      alert('Venta registrada en MySQL y stock actualizado.');
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  async editarVenta(venta: Venta): Promise<void> {
    const listaClientes = this.clientes.map((cliente) => `${cliente.id} - ${cliente.nombre}`).join('\n');
    const clienteTexto = prompt(`ID del cliente:\n\n${listaClientes}`, venta.clienteId.toString());
    if (clienteTexto === null) return;

    const clienteId = Number(clienteTexto);
    if (!this.clientes.some((cliente) => cliente.id === clienteId)) {
      alert('Cliente no válido.');
      return;
    }

    const listaPerfumes = this.perfumes
      .map((perfume) => `${perfume.id} - ${perfume.nombre} - ${perfume.marca} - $${perfume.precio} - Stock: ${perfume.stock}`)
      .join('\n');
    const perfumeTexto = prompt(`ID del perfume:\n\n${listaPerfumes}`, venta.perfumeId.toString());
    if (perfumeTexto === null) return;

    const perfumeId = Number(perfumeTexto);
    if (!this.perfumes.some((perfume) => perfume.id === perfumeId)) {
      alert('Perfume no válido.');
      return;
    }

    const cantidadTexto = prompt('Cantidad:', venta.cantidad.toString());
    if (cantidadTexto === null) return;

    const cantidad = Number(cantidadTexto);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      alert('La cantidad no es válida.');
      return;
    }

    const fecha = prompt('Fecha:', venta.fecha);
    if (!fecha?.trim()) return;

    try {
      await this.ventaService.actualizar(venta.id, {
        clienteId,
        perfumeId,
        cantidad,
        fecha: fecha.trim(),
      });
      await this.cargarDatos();
      alert('Venta actualizada. El servidor recalculó el total y el stock.');
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  async eliminarVenta(venta: Venta): Promise<void> {
    if (!confirm(`¿Eliminar la venta #${venta.id}?`)) return;

    try {
      await this.ventaService.eliminar(venta.id);
      await this.cargarDatos();
      alert('Venta eliminada y stock restaurado.');
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  private fechaHoy(): string {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}/${fecha.getFullYear()}`;
  }

  private mensajeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
  }
}
