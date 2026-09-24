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

import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
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
export class ClientesPage implements OnInit {
  clientes: Cliente[] = [];

  constructor(
    private readonly clienteService: ClienteService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.cargarClientes();
  }

  async cargarClientes(): Promise<void> {
    try {
      this.clientes = await this.clienteService.listar();
      this.cdr.markForCheck();
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  async agregarCliente(): Promise<void> {
    const nombre = prompt('Nombre del cliente:');
    if (!nombre?.trim()) return;

    const telefono = prompt('Teléfono:');
    if (!telefono?.trim()) return;

    const correo = prompt('Correo electrónico:');
    if (!correo?.trim()) return;

    try {
      await this.clienteService.crear({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
      });
      await this.cargarClientes();
      alert('Cliente registrado en MySQL.');
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  async editarCliente(cliente: Cliente): Promise<void> {
    const nombre = prompt('Nombre:', cliente.nombre);
    if (!nombre?.trim()) return;

    const telefono = prompt('Teléfono:', cliente.telefono);
    if (!telefono?.trim()) return;

    const correo = prompt('Correo:', cliente.correo);
    if (!correo?.trim()) return;

    try {
      await this.clienteService.actualizar(cliente.id, {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
      });
      await this.cargarClientes();
      alert('Cliente actualizado.');
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  async eliminarCliente(cliente: Cliente): Promise<void> {
    if (!confirm(`¿Eliminar al cliente ${cliente.nombre}?`)) return;

    try {
      await this.clienteService.eliminar(cliente.id);
      await this.cargarClientes();
      alert('Cliente eliminado.');
    } catch (error) {
      alert(this.mensajeError(error));
    }
  }

  private mensajeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
  }
}
