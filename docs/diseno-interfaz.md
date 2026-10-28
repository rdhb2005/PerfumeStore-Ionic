# Criterios de diseño aplicados

PerfumeStore conserva su dirección editorial de fondo hueso, tinta negra y rosa apagado. La actualización visual evita convertir el proyecto en una interfaz genérica y mantiene una sola familia de color, forma y jerarquía.

## Motion

- Las interacciones frecuentes usan duraciones cortas, principalmente entre 140 y 260 ms.
- Se animan `transform`, `opacity`, color y fondo, evitando transiciones generales sobre propiedades de layout.
- Los botones tienen una respuesta de presión sutil con escala cercana a 1, no animaciones exageradas.
- Las entradas utilizan `ease-out` para responder de inmediato.
- Se respeta `prefers-reduced-motion`.

## Jerarquía y layout

- Títulos editoriales grandes, texto auxiliar compacto y etiquetas pequeñas consistentes.
- Espaciado responsivo con `clamp()` y bloques que cambian de dos columnas a una en móvil.
- Las fotografías son parte estructural de la ficha del perfume, no un adorno colocado encima del contenido.
- Un solo lenguaje de bordes rectos y contraste, consistente con el resto de PerfumeStore.

## Referencias de dirección

La dirección se inspira en catálogos contemporáneos de perfumería con fotografía de producto protagonista, estructura editorial y mucho espacio visual, conservando la identidad ya establecida del proyecto en lugar de copiar una página específica.
