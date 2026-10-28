# PerfumeStore — Design System

## Paleta

- Ink: `#0d0d0c`
- Bone: `#f2e9de`
- Paper: `#f8f3ec`
- Dusty rose: `#ddc9c0`

La paleta usa un solo acento cálido y mantiene contraste alto. No se usan gradientes ni sombras como recurso principal.

## Tipografía

Stack: `Sofia Pro`, `Manrope`, system UI. Los títulos usan peso alto, tracking negativo y escala editorial. Las etiquetas pequeñas usan mayúsculas y tracking moderado para diferenciar metadatos sin competir con el contenido.

## Forma

Sistema de esquinas rectas. Separaciones con líneas de 1 px y bloques estructurales. Las fotografías se recortan con `object-fit: cover` dentro del catálogo y `contain` en el visor ampliado.

## Espaciado

Se priorizan márgenes fluidos con `clamp()` y cambios responsivos explícitos a 860 px y 620 px. La información principal mantiene espacio respirable; los metadatos se agrupan en bloques compactos.

## Motion

- Respuesta de presión: 140 ms, `scale(.985)`.
- Feedback/entrada: 180–240 ms.
- Curva principal: `cubic-bezier(.22, 1, .36, 1)`.
- Se animan transform, opacity y color; no layout.
- Hover solo con `@media (hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion` elimina movimiento no esencial.

## Multimedia

La fotografía es parte de la ficha del perfume. El usuario puede tomar una foto, elegirla de galería, ampliarla, cambiarla y eliminarla. Los metadatos básicos se muestran en el visor; GPS no se presenta.
