# Colección de videojuegos

Catálogo personal de consolas y videojuegos: 16 consolas, cientos de juegos organizados por saga, con carátulas, marcado de versiones japonesas, ediciones especiales y duplicados. Construido con React + Vite y el design system definido en `src/styles/colors-and-type.css`.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción en dist/
npm run preview  # sirve el build de producción
npm run lint      # oxlint
```

## Estructura

- `src/data/consoles.js` — datos de las 16 consolas de la colección.
- `src/data/games.js` — catálogo de juegos agrupados por consola y saga.
- `src/hooks/useCovers.js` — resolución de carátulas: usa el hash de IGDB embebido en los datos cuando existe (CDN público, sin clave) y, si no, consulta la API pública de Wikipedia (sin clave, con CORS) como respaldo. Cachea resultados en `localStorage`.
- `src/components/` — componentes de la UI (tarjetas de juego, tabs de consola, panel de consola, logo).
- `src/styles/colors-and-type.css` — tokens del design system (paleta, tipografía, espaciado, sombras).
- `src/styles/app.css` — estilos de los componentes de la app, construidos sobre esos tokens.
- `docs/design-system.html` — hoja de estilo imprimible (marca, componentes) usada como referencia visual.

## Carátulas

No se usa ninguna API key: las imágenes salen del CDN público de IGDB (cuando el juego ya tiene un hash conocido en los datos) o de la API pública de Wikipedia como respaldo. No hay llamadas a la API de Anthropic ni a ningún servicio que requiera autenticación desde el cliente.
