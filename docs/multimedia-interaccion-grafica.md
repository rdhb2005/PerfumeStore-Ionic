# Multimedia e interacción gráfica

## Funcionalidad integrada

La sección **Perfumes** permite asociar una fotografía local a cada perfume. Desde la interfaz se puede elegir entre **Tomar fotografía** y **Elegir de galería**. La imagen se guarda en el almacenamiento privado de la aplicación con Capacitor Filesystem y la referencia ligera se conserva con Capacitor Preferences.

La implementación no modifica la base de datos MySQL ni rompe el CRUD existente. La foto funciona como información multimedia local relacionada con el `id` del perfume.

## Interacción gráfica

- Vista previa integrada dentro de cada registro.
- Toque sobre la imagen para abrir un visor ampliado.
- Acción para cambiar o eliminar la fotografía.
- Estados de carga mientras se procesa la imagen.
- Diseño responsivo para móvil y pantallas más anchas.
- Microinteracciones de presión, hover cuando existe puntero y transiciones cortas.
- Respeto de `prefers-reduced-motion`.

## Metadatos

La aplicación utiliza la información proporcionada por Capacitor Camera y `exifr` para intentar mostrar:

- origen de la imagen;
- fecha;
- dispositivo/cámara;
- resolución;
- formato;
- tamaño del archivo.

La interfaz no presenta coordenadas GPS.

## Persistencia

Las imágenes se guardan en `Directory.Data`, dentro de una carpeta lógica `perfumes/`. En Preferences únicamente se almacena la relación entre el perfume y el archivo junto con sus metadatos, evitando guardar imágenes grandes directamente dentro de Preferences.

## Corrección del modo local

El estado de modo local ahora se guarda también en Preferences. Cuando la API vuelve a responder, la aplicación mantiene el indicador local mientras `SincronizacionService` actualiza perfumes, clientes y ventas. Solo después de que las tres consultas remotas terminan correctamente se confirma el regreso al modo sincronizado.

## Flujo multimedia

```text
Perfume
  ↓
Elegir origen
  ├─ Cámara
  └─ Galería
  ↓
Capacitor Camera
  ↓
Lectura de imagen + metadatos EXIF
  ↓
Capacitor Filesystem (archivo local)
  ↓
Preferences (referencia + metadatos)
  ↓
Vista previa / visor ampliado
```
