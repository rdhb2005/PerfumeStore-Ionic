# PerfumeStore

PerfumeStore es una aplicación desarrollada con Ionic y Angular para administrar perfumes, clientes y ventas.

## Actividad 3: Persistencia local en Ionic

Esta versión utiliza dos tipos de persistencia:

- **MySQL + API PHP:** almacena de forma permanente los perfumes, clientes y ventas.
- **Capacitor Preferences:** guarda borradores de venta localmente en el dispositivo, incluso después de cerrar y volver a abrir la aplicación.

La estructura sigue la misma idea usada en clase: las páginas consumen servicios Angular; los datos principales viajan a una API PHP y los borradores locales pasan por un servicio de almacenamiento basado en Preferences.

## Requisitos

- Node.js y npm
- Ionic CLI
- XAMPP con Apache y MySQL activos
- Backend `perfumestore_api` dentro de `/Applications/XAMPP/xamppfiles/htdocs/`
- Base de datos `perfumestore` importada desde `database.sql`

## Instalación

```bash
npm install
ionic serve
```

La API debe responder en:

```text
http://localhost/perfumestore_api
```

## Funcionalidades

### Perfumes

- Alta
- Consulta
- Modificación
- Eliminación
- Persistencia en MySQL

### Clientes

- Alta
- Consulta
- Modificación
- Eliminación
- Persistencia en MySQL

### Ventas

- Alta
- Consulta
- Modificación
- Eliminación
- Cálculo del total en el servidor
- Descuento y restauración de stock desde la API
- Persistencia en MySQL

### Borradores locales

Los borradores de venta se guardan con `@capacitor/preferences`.

- Alta local
- Consulta local
- Modificación local
- Eliminación local
- Permanecen después de cerrar/reabrir la aplicación
- Se pueden convertir posteriormente en una venta real almacenada en MySQL

## Servicios principales

```text
src/app/services/api.service.ts
src/app/services/almacenamiento.service.ts
src/app/services/perfume.service.ts
src/app/services/cliente.service.ts
src/app/services/venta.service.ts
src/app/services/borrador-venta.service.ts
```

## API en dispositivo físico

En `src/environments/environment.ts`, `localhost` funciona cuando Ionic y XAMPP se ejecutan en la misma Mac. En un dispositivo físico se debe sustituir por la IP local de la Mac, por ejemplo:

```text
http://192.168.1.50/perfumestore_api
```

## Video sugerido para la actividad

1. Abrir **Borradores locales**.
2. Crear un borrador.
3. Cerrar la aplicación o pestaña.
4. Volver a abrirla y mostrar que el borrador continúa guardado.
5. Editarlo y volver a abrir la aplicación para comprobar el cambio.
6. Eliminarlo o registrarlo como venta.
7. Mostrar en phpMyAdmin que una venta registrada sí aparece en MySQL.
