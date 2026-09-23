import { Injectable } from '@angular/core';
import { Cliente } from '../models/cliente.model';

@Injectable({
    providedIn: 'root'
})
export class ClienteService {

    private readonly clave = 'clientes';

    constructor() {
        this.inicializarDatos();
    }

    private inicializarDatos(): void {

        const datos = localStorage.getItem(this.clave);

        if (!datos) {

            const clientesIniciales: Cliente[] = [
                {
                    id: 1,
                    nombre: 'Daniel Hernández',
                    telefono: '618 123 4567',
                    correo: 'daniel@email.com'
                },
                {
                    id: 2,
                    nombre: 'María González',
                    telefono: '618 987 6543',
                    correo: 'maria@email.com'
                },
                {
                    id: 3,
                    nombre: 'Carlos Rivera',
                    telefono: '618 555 4321',
                    correo: 'carlos@email.com'
                }
            ];

            this.guardar(clientesIniciales);
        }
    }

    listar(): Cliente[] {

        const datos = localStorage.getItem(this.clave);

        if (!datos) {
            return [];
        }

        return JSON.parse(datos);
    }

    obtener(id: number): Cliente | undefined {

        return this.listar().find(
            cliente => cliente.id === id
        );
    }

    crear(datos: Omit<Cliente, 'id'>): Cliente {

        const clientes = this.listar();

        const nuevoId =
            clientes.length > 0
                ? Math.max(...clientes.map(c => c.id)) + 1
                : 1;

        const nuevoCliente: Cliente = {
            id: nuevoId,
            ...datos
        };

        clientes.push(nuevoCliente);

        this.guardar(clientes);

        return nuevoCliente;
    }

    actualizar(
        id: number,
        datos: Partial<Cliente>
    ): boolean {

        const clientes = this.listar();

        const indice = clientes.findIndex(
            cliente => cliente.id === id
        );

        if (indice === -1) {
            return false;
        }

        clientes[indice] = {
            ...clientes[indice],
            ...datos,
            id
        };

        this.guardar(clientes);

        return true;
    }

    eliminar(id: number): boolean {

        const clientes = this.listar();

        const nuevosClientes = clientes.filter(
            cliente => cliente.id !== id
        );

        if (nuevosClientes.length === clientes.length) {
            return false;
        }

        this.guardar(nuevosClientes);

        return true;
    }

    private guardar(clientes: Cliente[]): void {

        localStorage.setItem(
            this.clave,
            JSON.stringify(clientes)
        );
    }
}