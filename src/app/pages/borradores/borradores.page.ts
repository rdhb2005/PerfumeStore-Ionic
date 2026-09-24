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

import { BorradorVenta } from '../../models/borrador-venta.model';
import { Cliente } from '../../models/cliente.model';
import { Perfume } from '../../models/perfume.model';
import { BorradorVentaService } from '../../services/borrador-venta.service';
import { ClienteService } from '../../services/cliente.service';
import { PerfumeService } from '../../services/perfume.service';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-borradores',
  templateUrl: './borradores.page.html',
  styleUrls: ['./borradores.page.scss'],
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
export class BorradoresPage implements OnInit {
  borradores: BorradorVenta[] = [];
  clientes: Cliente[] = [];
  perfumes: Perfume[] = [];

  constructor(
    private readonly borradorService: BorradorVentaService,
    private readonly clienteService: ClienteService,
    private readonly perfumeService: PerfumeService,
    private readonly ventaService: VentaService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.borradores = await this.borradorService.listar();
    this.cdr.markForCheck();

    try {
      const [clientes, perfumes] = await Promise.all([
        this.clienteService.listar(),
        this.perfumeService.listar(),
      ]);
      this.clientes = clientes;
      this.perfumes = perfumes;
      this.cdr.markForCheck();
    } catch {
      // Los borradores locales siguen disponibles aunque la API no responda.
    }
  }

  obtenerCliente(clienteId: number): string {
    return this.clientes.find((cliente) => cliente.id === clienteId)?.nombre ?? `Cliente #${clienteId}`;
  }

  obtenerPerfume(perfumeId: number): string {
    const perfume = this.perfumes.find((item) => item.id === perfumeId);
    return perfume ? `${perfume.nombre} - ${perfume.marca}` : `Perfume #${perfumeId}`;
  }

  totalEstimado(borrador: BorradorVenta): number {
    const perfume = this.perfumes.find((item) => item.id === borrador.perfumeId);
    return perfume ? perfume.precio * borrador.cantidad : 0;
  }

  async agregarBorrador(): Promise<void> {
    if (this.clientes.length === 0 || this.perfumes.length === 0) {
      alert('Para crear un borrador, primero debe estar disponible la API con clientes y perfumes.');
      return;
    }

    const clienteId = this.pedirCliente();
    if (clienteId === null) return;

    const perfumeId = this.pedirPerfume();
    if (perfumeId === null) return;

    const cantidad = this.pedirCantidad(1);
    if (cantidad === null) return;

    const fecha = prompt('Fecha prevista:', this.fechaHoy());
    if (!fecha?.trim()) return;

    const notas = prompt('Notas del borrador (opcional):', '') ?? '';

    await this.borradorService.crear({
      clienteId,
      perfumeId,
      cantidad,
      fecha: fecha.trim(),
      notas: notas.trim(),
    });

    this.borradores = await this.borradorService.listar();
    this.cdr.markForCheck();
    alert('Borrador guardado localmente con Capacitor Preferences.');
  }

  async editarBorrador(borrador: BorradorVenta): Promise<void> {
    const clienteId = this.pedirCliente(borrador.clienteId);
    if (clienteId === null) return;

    const perfumeId = this.pedirPerfume(borrador.perfumeId);
    if (perfumeId === null) return;

    const cantidad = this.pedirCantidad(borrador.cantidad);
    if (cantidad === null) return;

    const fecha = prompt('Fecha prevista:', borrador.fecha);
    if (!fecha?.trim()) return;

    const notas = prompt('Notas:', borrador.notas);
    if (notas === null) return;

    await this.borradorService.actualizar(borrador.id, {
      clienteId,
      perfumeId,
      cantidad,
      fecha: fecha.trim(),
      notas: notas.trim(),
    });

    this.borradores = await this.borradorService.listar();
    this.cdr.markForCheck();
    alert('Borrador local actualizado.');
  }

  async eliminarBorrador(borrador: BorradorVenta): Promise<void> {
    if (!confirm('¿Eliminar este borrador del dispositivo?')) return;

    await this.borradorService.eliminar(borrador.id);
    this.borradores = await this.borradorService.listar();
    this.cdr.markForCheck();
    alert('Borrador eliminado del almacenamiento local.');
  }

  async registrarVenta(borrador: BorradorVenta): Promise<void> {
    if (!confirm('¿Registrar este borrador como una venta real en MySQL?')) return;

    try {
      await this.ventaService.crear({
        clienteId: borrador.clienteId,
        perfumeId: borrador.perfumeId,
        cantidad: borrador.cantidad,
        fecha: borrador.fecha,
      });
      await this.borradorService.eliminar(borrador.id);
      await this.cargarDatos();
      alert('Venta registrada en MySQL. El borrador local fue eliminado.');
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  private pedirCliente(actual?: number): number | null {
    const lista = this.clientes.map((cliente) => `${cliente.id} - ${cliente.nombre}`).join('\n');
    const valor = prompt(`ID del cliente:\n\n${lista}`, actual?.toString());
    if (valor === null) return null;

    const id = Number(valor);
    if (!this.clientes.some((cliente) => cliente.id === id)) {
      alert('Cliente no válido.');
      return null;
    }
    return id;
  }

  private pedirPerfume(actual?: number): number | null {
    const lista = this.perfumes
      .map((perfume) => `${perfume.id} - ${perfume.nombre} - $${perfume.precio} - Stock: ${perfume.stock}`)
      .join('\n');
    const valor = prompt(`ID del perfume:\n\n${lista}`, actual?.toString());
    if (valor === null) return null;

    const id = Number(valor);
    if (!this.perfumes.some((perfume) => perfume.id === id)) {
      alert('Perfume no válido.');
      return null;
    }
    return id;
  }

  private pedirCantidad(actual: number): number | null {
    const valor = prompt('Cantidad:', actual.toString());
    if (valor === null) return null;

    const cantidad = Number(valor);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      alert('La cantidad debe ser un número entero mayor que cero.');
      return null;
    }
    return cantidad;
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
