import { Injectable, inject } from '@angular/core';
import { Perfume } from '../models/perfume.model';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';
/**
 Este servicio utiliza ApiService para trabajar con los perfumes
Permite listar, crear, modificar y eliminar registros mediante el endpoint perfumes.php
 */
@Injectable({ providedIn: 'root' })
export class PerfumeService {
  private readonly api = inject(ApiService);
  private readonly cache = inject(CacheService);
  private readonly archivo = 'perfumes.php';

  // Este método consulta los perfumes y usa la última copia local si la API falla.
  listar(): Promise<Perfume[]> {
    return this.cache.obtenerConRespaldo('perfumes', () => this.api.get<Perfume[]>(this.archivo));
  }

  obtener(id: number): Promise<Perfume> {
    return this.api.get<Perfume>(this.archivo, { id });
  }

  // Este método registra un perfume nuevo. La operación requiere conexión con el servidor.
  crear(datos: Omit<Perfume, 'id'>): Promise<Perfume> {
    return this.api.post<Perfume>(this.archivo, datos);
  }

  // Este método actualiza la información de un perfume. La operación requiere conexión.
  actualizar(id: number, datos: Partial<Omit<Perfume, 'id'>>): Promise<Perfume> {
    return this.api.patch<Perfume>(this.archivo, datos, { id });
  }

  // Este método elimina un perfume mediante la API.
  eliminar(id: number): Promise<null> {
    return this.api.delete(this.archivo, { id });
  }
}
