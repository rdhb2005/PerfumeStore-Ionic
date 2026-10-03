import { Injectable, inject } from '@angular/core';
import { BorradorVenta, BorradorVentaGuardar } from '../models/borrador-venta.model';
import { AlmacenamientoService } from './almacenamiento.service';

const CLAVE = 'perfumestore_borradores_venta';
/**
en este archivo se implementa el CRUD de los borradores de venta. es el que se encarga de crear, consultar, actualizar 
 y eliminar borradores usando el servicio de almacenamiento
 */
/** CRUD local de borradores almacenados con Capacitor Preferences. */
@Injectable({ providedIn: 'root' })
export class BorradorVentaService {
  private readonly almacenamiento = inject(AlmacenamientoService);

  // Este método obtiene los borradores guardados en el dispositivo.
  async listar(): Promise<BorradorVenta[]> {
    const borradores = await this.almacenamiento.leer<BorradorVenta[]>(CLAVE, []);
    return [...borradores].sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  }

  async obtener(id: string): Promise<BorradorVenta | undefined> {
    return (await this.listar()).find((borrador) => borrador.id === id);
  }

  // Este método crea y guarda un nuevo borrador.
  async crear(datos: BorradorVentaGuardar): Promise<BorradorVenta> {
    const ahora = new Date().toISOString();
    const borrador: BorradorVenta = {
      ...datos,
      id: nuevoId(),
      creado: ahora,
      actualizado: ahora,
    };

    const borradores = await this.listar();
    await this.almacenamiento.guardar(CLAVE, [...borradores, borrador]);
    return borrador;
  }

  // Este método modifica un borrador existente.
  async actualizar(id: string, datos: Partial<BorradorVentaGuardar>): Promise<BorradorVenta> {
    const borradores = await this.listar();
    const indice = borradores.findIndex((borrador) => borrador.id === id);

    if (indice === -1) {
      throw new Error('El borrador ya no existe en este dispositivo.');
    }

    const actualizado: BorradorVenta = {
      ...borradores[indice],
      ...datos,
      id,
      actualizado: new Date().toISOString(),
    };

    borradores[indice] = actualizado;
    await this.almacenamiento.guardar(CLAVE, borradores);
    return actualizado;
  }

  // Este método elimina un borrador del almacenamiento local.
  async eliminar(id: string): Promise<void> {
    const borradores = await this.listar();
    await this.almacenamiento.guardar(
      CLAVE,
      borradores.filter((borrador) => borrador.id !== id),
    );
  }
}

function nuevoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
