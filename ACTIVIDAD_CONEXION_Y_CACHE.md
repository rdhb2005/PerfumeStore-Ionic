# Actividad: manejo de conexión, errores y caché

## Cambios implementados

- Detección automática del estado de red y disponibilidad de la API.
- Aviso global cuando no hay conexión o el servidor no responde.
- Tiempo máximo de espera para evitar peticiones colgadas.
- Caché local con Capacitor Preferences para perfumes, clientes y ventas.
- Uso automático del último caché cuando una consulta remota falla.
- Mensajes diferenciados para falta de red, servidor no disponible y falta de caché.
- Las altas, modificaciones y eliminaciones siguen requiriendo conexión real con MySQL.
- Los borradores continúan funcionando de forma local con Preferences.

## Archivos nuevos

- `src/app/services/estado-conexion.service.ts`
- `src/app/services/cache.service.ts`

## Archivos actualizados

- `src/app/app.component.ts`
- `src/app/app.component.html`
- `src/app/app.component.scss`
- `src/app/services/api.service.ts`
- `src/app/services/conexion.service.ts`
- `src/app/services/perfume.service.ts`
- `src/app/services/cliente.service.ts`
- `src/app/services/venta.service.ts`
- `src/app/pages/login/login.page.ts`

## Prueba sin conexión

1. Iniciar Apache y MySQL.
2. Entrar a la aplicación normalmente.
3. Abrir Perfumes, Clientes y Ventas una vez para generar las copias locales.
4. Detener Apache o desconectar la red.
5. Volver a entrar a Perfumes, Clientes o Ventas.
6. La aplicación debe mostrar el aviso de conexión y cargar la última copia local.
7. Intentar crear, editar o eliminar un registro para comprobar que se informa que la operación necesita al servidor.
8. Volver a iniciar Apache o recuperar la red y pulsar `COMPROBAR` en el aviso.

> Si nunca se consultó una sección antes de perder la conexión, no existirá caché para esa sección y se mostrará un mensaje indicándolo.
