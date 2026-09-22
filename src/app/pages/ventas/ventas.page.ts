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

import { Venta } from '../../models/venta.model';

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
    IonButtons,
    IonBackButton
  ]
})
export class VentasPage {

  ventas: Venta[] = [
    {
      id: 1,
      cliente: 'Daniel Hernández',
      perfume: 'Sauvage - Dior',
      cantidad: 1,
      total: 2850,
      fecha: '21/09/2026'
    },
    {
      id: 2,
      cliente: 'María González',
      perfume: 'Eros - Versace',
      cantidad: 2,
      total: 4200,
      fecha: '21/09/2026'
    },
    {
      id: 3,
      cliente: 'Carlos Rivera',
      perfume: 'Bleu de Chanel',
      cantidad: 1,
      total: 3200,
      fecha: '22/09/2026'
    }
  ];

}