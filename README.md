# PerfumeStore

PerfumeStore es una aplicación desarrollada con Ionic y Angular para administrar perfumes, clientes y ventas. El proyecto utiliza una API desarrollada en PHP y una base de datos MySQL para almacenar la información principal. También cuenta con persistencia local, inicio de sesión, manejo de errores y una estrategia básica para seguir consultando información cuando existe algún problema de conexión.

## Tecnologías utilizadas

- Ionic
- Angular
- TypeScript
- Capacitor Preferences
- PHP
- MySQL
- XAMPP
- Git y GitHub

## Inicio de sesión

La aplicación cuenta con una pantalla de inicio de sesión donde se solicita usuario, contraseña y la dirección del servidor donde se encuentran las APIs.

Usuario de prueba:

admin

Contraseña:

admin123

Ejemplo de servidor:

192.168.1.194:80

La dirección IP puede cambiar dependiendo de la red a la que se encuentre conectado el equipo.

## Perfumes

La sección de perfumes permite realizar las operaciones principales del CRUD:

- Alta de perfumes.
- Consulta de perfumes.
- Modificación de perfumes.
- Eliminación de perfumes.
- Persistencia de la información en MySQL.

## Clientes

La sección de clientes permite:

- Alta de clientes.
- Consulta de clientes.
- Modificación de clientes.
- Eliminación de clientes.
- Persistencia de la información en MySQL.

## Ventas

La sección de ventas permite:

- Registrar ventas.
- Consultar ventas.
- Modificar ventas.
- Eliminar ventas.
- Calcular el total de la venta.
- Actualizar el stock de los perfumes.
- Guardar las ventas en MySQL.

## Borradores locales

La aplicación permite crear borradores de venta que se almacenan localmente mediante Capacitor Preferences.

Los borradores pueden crearse, consultarse, modificarse y eliminarse. También permanecen guardados después de cerrar y volver a abrir la aplicación y posteriormente pueden convertirse en una venta almacenada en MySQL.

## Manejo de conexión y errores

PerfumeStore puede detectar problemas de conexión con el servidor y mostrar mensajes al usuario dependiendo de la situación.

La aplicación puede identificar cuando se encuentra conectada correctamente, cuando no existe conexión o cuando la API no se encuentra disponible.

Si ocurre un problema al realizar una consulta, la aplicación puede utilizar la última información almacenada localmente. Las operaciones que modifican información en MySQL necesitan conexión con el servidor para evitar mostrar datos como guardados cuando realmente no llegaron a la base de datos.

## Caché local

Se utiliza Capacitor Preferences para almacenar temporalmente la última información consultada de:

- Perfumes.
- Clientes.
- Ventas.

Esto permite seguir mostrando la última información disponible cuando la API no puede ser consultada temporalmente.

## Servicios principales

Los principales servicios utilizados en el proyecto son:

src/app/services/api.service.ts  
src/app/services/almacenamiento.service.ts  
src/app/services/cache.service.ts  
src/app/services/conexion.service.ts  
src/app/services/estado-conexion.service.ts  
src/app/services/perfume.service.ts  
src/app/services/cliente.service.ts  
src/app/services/venta.service.ts  
src/app/services/borrador-venta.service.ts

## Requisitos

Para ejecutar el proyecto se necesita:

- Node.js.
- npm.
- Ionic CLI.
- XAMPP.
- Apache activo.
- MySQL activo.
- La carpeta perfumestore_api dentro de /Applications/XAMPP/xamppfiles/htdocs/
- La base de datos perfumestore.

## Instalación

Primero se deben instalar las dependencias del proyecto con:

npm install

Después se puede iniciar la aplicación con:

ionic serve

La API debe encontrarse disponible desde la dirección configurada en el login. Por ejemplo:

http://192.168.1.194:80/perfumestore_api/

## Funcionamiento general

La aplicación Ionic se comunica con los servicios de Angular, los cuales realizan las peticiones hacia la API desarrollada en PHP. La API se conecta con MySQL para consultar y modificar la información de perfumes, clientes y ventas.

Para la información local, la aplicación utiliza Capacitor Preferences, principalmente para los borradores y la caché utilizada cuando existe algún problema de conexión.

## Repositorio

https://github.com/rdhb2005/PerfumeStore-Ionic