import { Injectable, inject } from '@angular/core';
import { Perfume } from '../models/perfume.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PerfumeService {
  private readonly api = inject(ApiService);
  private readonly archivo = 'perfumes.php';

  listar(): Promise<Perfume[]> {
    return this.api.get<Perfume[]>(this.archivo);
  }

  obtener(id: number): Promise<Perfume> {
    return this.api.get<Perfume>(this.archivo, { id });
  }

  crear(datos: Omit<Perfume, 'id'>): Promise<Perfume> {
    return this.api.post<Perfume>(this.archivo, datos);
  }

  actualizar(id: number, datos: Partial<Omit<Perfume, 'id'>>): Promise<Perfume> {
    return this.api.patch<Perfume>(this.archivo, datos, { id });
  }

  eliminar(id: number): Promise<null> {
    return this.api.delete(this.archivo, { id });
  }
}
