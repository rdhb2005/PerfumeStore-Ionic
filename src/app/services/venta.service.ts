import { Injectable, inject } from '@angular/core';
import { Venta, VentaGuardar } from '../models/venta.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly api = inject(ApiService);
  private readonly archivo = 'ventas.php';

  listar(): Promise<Venta[]> {
    return this.api.get<Venta[]>(this.archivo);
  }

  obtener(id: number): Promise<Venta> {
    return this.api.get<Venta>(this.archivo, { id });
  }

  crear(datos: VentaGuardar): Promise<Venta> {
    return this.api.post<Venta>(this.archivo, datos);
  }

  actualizar(id: number, datos: Partial<VentaGuardar>): Promise<Venta> {
    return this.api.patch<Venta>(this.archivo, datos, { id });
  }

  eliminar(id: number): Promise<null> {
    return this.api.delete(this.archivo, { id });
  }
}
