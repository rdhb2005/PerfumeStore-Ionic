import { Injectable, inject } from '@angular/core';
import { Cliente } from '../models/cliente.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly api = inject(ApiService);
  private readonly archivo = 'clientes.php';

  listar(): Promise<Cliente[]> {
    return this.api.get<Cliente[]>(this.archivo);
  }

  obtener(id: number): Promise<Cliente> {
    return this.api.get<Cliente>(this.archivo, { id });
  }

  crear(datos: Omit<Cliente, 'id'>): Promise<Cliente> {
    return this.api.post<Cliente>(this.archivo, datos);
  }

  actualizar(id: number, datos: Partial<Omit<Cliente, 'id'>>): Promise<Cliente> {
    return this.api.patch<Cliente>(this.archivo, datos, { id });
  }

  eliminar(id: number): Promise<null> {
    return this.api.delete(this.archivo, { id });
  }
}
