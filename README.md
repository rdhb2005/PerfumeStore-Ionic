# PerfumeStore

PerfumeStore es una aplicación móvil desarrollada con Ionic y Angular para la administración básica de una tienda de perfumes.

El proyecto fue creado como parte de la materia Programación Móvil II con el objetivo de establecer una aplicación base que pueda ser ampliada durante el cuatrimestre.

## Objetivo

Desarrollar una aplicación móvil sencilla que permita visualizar perfumes disponibles, consultar clientes registrados y mostrar un historial básico de ventas.

## Tecnologías utilizadas

- Ionic
- Angular
- TypeScript
- HTML
- SCSS
- Git

## Funcionalidades

La aplicación cuenta actualmente con cuatro vistas principales:

### Inicio

Pantalla principal de la aplicación desde la cual se puede navegar hacia las diferentes secciones.

### Perfumes

Muestra un catálogo básico de perfumes con la siguiente información:

- Nombre
- Marca
- Tipo de fragancia
- Precio
- Stock disponible

### Clientes

Muestra los clientes registrados con información como:

- Nombre
- Teléfono
- Correo electrónico

### Ventas

Muestra un historial básico de ventas con:

- Número de venta
- Cliente
- Perfume
- Cantidad
- Total
- Fecha

## Modelo inicial de datos

La aplicación utiliza interfaces de TypeScript para representar la información.

### Perfume

```typescript
export interface Perfume {
  id: number;
  nombre: string;
  marca: string;
  tipo: string;
  precio: number;
  stock: number;
}