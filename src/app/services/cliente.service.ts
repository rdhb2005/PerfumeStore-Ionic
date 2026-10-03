import { Injectable, inject } from '@angular/core';
import { Cliente } from '../models/cliente.model';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly api = inject(ApiService);
  private readonly cache = inject(CacheService);
  private readonly archivo = 'clientes.php';

  // Este método consulta los clientes y usa la última copia local si la API falla.
  listar(): Promise<Cliente[]> {
    return this.cache.obtenerConRespaldo('clientes', () => this.api.get<Cliente[]>(this.archivo));
  }

  obtener(id: number): Promise<Cliente> {
    return this.api.get<Cliente>(this.archivo, { id });
  }

  // Este método registra un cliente nuevo. La operación requiere conexión con el servidor.
  crear(datos: Omit<Cliente, 'id'>): Promise<Cliente> {
    return this.api.post<Cliente>(this.archivo, datos);
  }

  // Este método actualiza los datos de un cliente. La operación requiere conexión.
  actualizar(id: number, datos: Partial<Omit<Cliente, 'id'>>): Promise<Cliente> {
    return this.api.patch<Cliente>(this.archivo, datos, { id });
  }

  // Este método elimina un cliente mediante la API.
  eliminar(id: number): Promise<null> {
    return this.api.delete(this.archivo, { id });
  }
}
