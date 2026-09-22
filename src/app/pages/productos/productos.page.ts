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

  perfumes: Perfume[] = [
    {
      id: 1,
      nombre: 'Sauvage',
      marca: 'Dior',
      tipo: 'Eau de Parfum',
      precio: 2850,
      stock: 8
    },
    {
      id: 2,
      nombre: 'Eros',
      marca: 'Versace',
      tipo: 'Eau de Toilette',
      precio: 2100,
      stock: 12
    },
    {
      id: 3,
      nombre: 'Bleu de Chanel',
      marca: 'Chanel',
      tipo: 'Eau de Parfum',
      precio: 3200,
      stock: 6
    }
  ];

}