import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.page').then((m) => m.ProductosPage),
  },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes.page').then((m) => m.ClientesPage),
  },
  {
    path: 'ventas',
    loadComponent: () => import('./pages/ventas/ventas.page').then((m) => m.VentasPage),
  },
  {
    path: 'borradores',
    loadComponent: () => import('./pages/borradores/borradores.page').then((m) => m.BorradoresPage),
  },
];
