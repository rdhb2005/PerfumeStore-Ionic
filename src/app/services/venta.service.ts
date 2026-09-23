import { Injectable } from '@angular/core';
import { Venta } from '../models/venta.model';

@Injectable({
    providedIn: 'root'
})
export class VentaService {

    private readonly clave = 'ventas';

    constructor() {
        this.inicializarDatos();
    }

    private inicializarDatos(): void {

        const datos = localStorage.getItem(this.clave);

        if (!datos) {

            const ventasIniciales: Venta[] = [
                {
                    id: 1,
                    clienteId: 1,
                    perfumeId: 1,
                    cantidad: 1,
                    precioUnitario: 2850,
                    total: 2850,
                    fecha: '21/09/2026'
                },
                {
                    id: 2,
                    clienteId: 2,
                    perfumeId: 2,
                    cantidad: 2,
                    precioUnitario: 2100,
                    total: 4200,
                    fecha: '21/09/2026'
                },
                {
                    id: 3,
                    clienteId: 3,
                    perfumeId: 3,
                    cantidad: 1,
                    precioUnitario: 3200,
                    total: 3200,
                    fecha: '22/09/2026'
                }
            ];

            this.guardar(ventasIniciales);
        }
    }

    listar(): Venta[] {

        const datos = localStorage.getItem(this.clave);

        if (!datos) {
            return [];
        }

        return JSON.parse(datos);
    }

    obtener(id: number): Venta | undefined {

        return this.listar().find(
            venta => venta.id === id
        );
    }

    crear(
        datos: Omit<Venta, 'id' | 'total'>
    ): Venta {

        const ventas = this.listar();

        const nuevoId =
            ventas.length > 0
                ? Math.max(...ventas.map(v => v.id)) + 1
                : 1;

        const nuevaVenta: Venta = {
            id: nuevoId,
            ...datos,
            total: datos.cantidad * datos.precioUnitario
        };

        ventas.push(nuevaVenta);

        this.guardar(ventas);

        return nuevaVenta;
    }

    actualizar(
        id: number,
        datos: Partial<Venta>
    ): boolean {

        const ventas = this.listar();

        const indice = ventas.findIndex(
            venta => venta.id === id
        );

        if (indice === -1) {
            return false;
        }

        const ventaActualizada: Venta = {
            ...ventas[indice],
            ...datos,
            id
        };

        ventaActualizada.total =
            ventaActualizada.cantidad *
            ventaActualizada.precioUnitario;

        ventas[indice] = ventaActualizada;

        this.guardar(ventas);

        return true;
    }

    eliminar(id: number): boolean {

        const ventas = this.listar();

        const nuevasVentas = ventas.filter(
            venta => venta.id !== id
        );

        if (nuevasVentas.length === ventas.length) {
            return false;
        }

        this.guardar(nuevasVentas);

        return true;
    }

    private guardar(ventas: Venta[]): void {

        localStorage.setItem(
            this.clave,
            JSON.stringify(ventas)
        );
    }
}