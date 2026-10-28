import { Injectable, inject } from '@angular/core';
import { Venta, VentaGuardar } from '../models/venta.model';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly api = inject(ApiService);
  private readonly cache = inject(CacheService);
  private readonly archivo = API_ENDPOINTS.ventas;

  // Este método consulta las ventas y usa la última copia local si la API falla.
  listar(): Promise<Venta[]> {
    return this.cache.obtenerConRespaldo('ventas', () => this.api.get<Venta[]>(this.archivo));
  }

  // Actualiza la copia local únicamente con una respuesta real del servidor.
  sincronizarDesdeServidor(): Promise<Venta[]> {
    return this.cache.actualizarDesdeRemoto('ventas', () =>
      this.api.get<Venta[]>(this.archivo),
    );
  }

  obtener(id: number): Promise<Venta> {
    return this.api.get<Venta>(this.archivo, { id });
  }

  // Este método registra una venta nueva. La operación requiere conexión con el servidor.
  crear(datos: VentaGuardar): Promise<Venta> {
    return this.api.post<Venta>(this.archivo, datos);
  }

  // Este método actualiza una venta existente. La operación requiere conexión.
  actualizar(id: number, datos: Partial<VentaGuardar>): Promise<Venta> {
    return this.api.patch<Venta>(this.archivo, datos, { id });
  }

  // Este método elimina una venta mediante la API.
  eliminar(id: number): Promise<null> {
    return this.api.delete(this.archivo, { id });
  }
}
