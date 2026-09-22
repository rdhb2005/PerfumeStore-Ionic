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
  IonButtons,
  IonBackButton
} from '@ionic/angular';

import { Cliente } from '../../models/cliente.model';

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
    IonButtons,
    IonBackButton
  ]
})
export class ClientesPage {

  clientes: Cliente[] = [
    {
      id: 1,
      nombre: 'Daniel Hernández',
      telefono: '618 123 4567',
      correo: 'daniel@email.com'
    },
    {
      id: 2,
      nombre: 'María González',
      telefono: '618 987 6543',
      correo: 'maria@email.com'
    },
    {
      id: 3,
      nombre: 'Carlos Rivera',
      telefono: '618 555 4321',
      correo: 'carlos@email.com'
    }
  ];

}