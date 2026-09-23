import { Injectable } from '@angular/core';
import { Perfume } from '../models/perfume.model';

@Injectable({
    providedIn: 'root'
})
export class PerfumeService {

    private readonly clave = 'perfumes';

    constructor() {
        this.inicializarDatos();
    }

    private inicializarDatos(): void {

        const datos = localStorage.getItem(this.clave);

        if (!datos) {

            const perfumesIniciales: Perfume[] = [
                {
                    id: 1,
                    nombre: 'Sauvage',
                    marca: 'Dior',
                    tipo: 'Eau de Parfum',
                    precio: 2850,
                    stock: 8
                },
                {
                    id: 2,
                    nombre: 'Eros',
                    marca: 'Versace',
                    tipo: 'Eau de Toilette',
                    precio: 2100,
                    stock: 12
                },
                {
                    id: 3,
                    nombre: 'Bleu de Chanel',
                    marca: 'Chanel',
                    tipo: 'Eau de Parfum',
                    precio: 3200,
                    stock: 6
                }
            ];

            this.guardar(perfumesIniciales);
        }
    }

    listar(): Perfume[] {

        const datos = localStorage.getItem(this.clave);

        if (!datos) {
            return [];
        }

        return JSON.parse(datos);
    }

    obtener(id: number): Perfume | undefined {

        return this.listar().find(
            perfume => perfume.id === id
        );
    }

    crear(datos: Omit<Perfume, 'id'>): Perfume {

        const perfumes = this.listar();

        const nuevoId =
            perfumes.length > 0
                ? Math.max(...perfumes.map(p => p.id)) + 1
                : 1;

        const nuevoPerfume: Perfume = {
            id: nuevoId,
            ...datos
        };

        perfumes.push(nuevoPerfume);

        this.guardar(perfumes);

        return nuevoPerfume;
    }

    actualizar(
        id: number,
        datos: Partial<Perfume>
    ): boolean {

        const perfumes = this.listar();

        const indice = perfumes.findIndex(
            perfume => perfume.id === id
        );

        if (indice === -1) {
            return false;
        }

        perfumes[indice] = {
            ...perfumes[indice],
            ...datos,
            id
        };

        this.guardar(perfumes);

        return true;
    }

    eliminar(id: number): boolean {

        const perfumes = this.listar();

        const nuevosPerfumes = perfumes.filter(
            perfume => perfume.id !== id
        );

        if (nuevosPerfumes.length === perfumes.length) {
            return false;
        }

        this.guardar(nuevosPerfumes);

        return true;
    }

    private guardar(perfumes: Perfume[]): void {

        localStorage.setItem(
            this.clave,
            JSON.stringify(perfumes)
        );
    }
}