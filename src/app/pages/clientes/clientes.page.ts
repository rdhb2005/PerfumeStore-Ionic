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
    IonBackButton
  ]
})
export class ClientesPage {

  clientes: Cliente[] = [];

  constructor(
    private clienteService: ClienteService
  ) {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clientes = this.clienteService.listar();
  }

  agregarCliente(): void {

    const nombre = prompt('Nombre del cliente:');

    if (!nombre || !nombre.trim()) {
      return;
    }

    const telefono = prompt('Teléfono:');

    if (!telefono || !telefono.trim()) {
      return;
    }

    const correo = prompt('Correo electrónico:');

    if (!correo || !correo.trim()) {
      return;
    }

    this.clienteService.crear({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      correo: correo.trim()
    });

    this.cargarClientes();
  }

  editarCliente(cliente: Cliente): void {

    const nombre = prompt(
      'Nombre:',
      cliente.nombre
    );

    if (nombre === null || !nombre.trim()) {
      return;
    }

    const telefono = prompt(
      'Teléfono:',
      cliente.telefono
    );

    if (telefono === null || !telefono.trim()) {
      return;
    }

    const correo = prompt(
      'Correo:',
      cliente.correo
    );

    if (correo === null || !correo.trim()) {
      return;
    }

    this.clienteService.actualizar(
      cliente.id,
      {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        correo: correo.trim()
      }
    );

    this.cargarClientes();
  }

  eliminarCliente(cliente: Cliente): void {

    const confirmar = confirm(
      `¿Eliminar al cliente ${cliente.nombre}?`
    );

    if (!confirmar) {
      return;
    }

    this.clienteService.eliminar(cliente.id);

    this.cargarClientes();
  }
}