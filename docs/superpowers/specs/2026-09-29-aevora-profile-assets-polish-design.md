# Aevora: perfil público, assets Steam y acabado del shell

## Objetivo

Elevar Aevora en tres entregas verificables: primero estabilizar imágenes y alineación, después convertir el perfil en una superficie pública dentro de la aplicación con una tienda separada, y finalmente pulir el shell con glass sutil, bordes redondeados y movimiento consistente.

La aplicación seguirá siendo local-first. No se añadirá un backend ni se fingirá que Steam almacena los puntos o cosméticos propios de Aevora.

## Alcance y límites

- La biblioteca, noticias, ofertas y logros siguen viniendo de Steam cuando la cuenta está conectada.
- El perfil propio de Aevora se guarda localmente junto con puntos, logros sincronizados, artículos comprados y artículos equipados.
- El perfil público dentro de Aevora será una vista de solo lectura del perfil local y de los datos públicos de Steam disponibles para la cuenta conectada.
- En otra PC, Steam puede aportar identidad, biblioteca pública y logros públicos; los cosméticos propios de Aevora no se sincronizarán entre PCs en esta entrega.
- No se guardarán contraseñas, API keys ni tokens en el frontend, el repositorio o `localStorage`.
- No se cambiará el inventario, saldo, perfil ni configuración de Steam.

## Diseño funcional

### Cap. 1 — Assets y layout estable

`SmartImage` tendrá una cadena de fallback explícita y observable: asset principal, fallback 1, fallback 2 y placeholder. Al fallar una imagen no se conservará un elemento roto ni se permitirá que la imagen determine una altura inesperada.

Cada contexto tendrá proporción propia:

- portada de biblioteca: formato vertical, `object-cover`, altura limitada;
- hero: banner horizontal, `object-cover`, overlay de legibilidad y altura limitada;
- logo: contenedor con `object-contain`, sin deformación ni recorte;
- icono/avatar: cuadrado estable, `object-cover` y fallback visual sobrio;
- Store: cards con ancho y relación fija, sin imágenes gigantes ni filas que se desplacen verticalmente.

El shell dejará de depender de anchos implícitos. Sidebar, búsqueda, navegación y contenido usarán columnas flexibles con `min-width: 0`, un ancho estable para la búsqueda y una zona de contenido que pueda encogerse sin cortar controles.

### Cap. 2 — Perfil público y tienda separada

Se añadirá una vista propia de perfil dentro de Aevora. El perfil tendrá dos estados:

- **Owner:** permite editar nombre, bio y avatar, además de abrir la tienda.
- **Visitor:** solo lectura; muestra identidad, fondo, marco, insignia, título, puntos visibles, estadísticas, logros y juegos destacados.

La tienda dejará de vivir dentro del panel de perfil. Será una vista separada con categorías de marcos, fondos, insignias y títulos. Comprar validará puntos, será idempotente y persistirá en el estado local. Equipar un artículo actualizará inmediatamente la vista del perfil para que cada cosmético tenga un efecto visible:

- marco: modifica el borde del avatar y la tarjeta;
- fondo: modifica el fondo visual del perfil;
- insignia: aparece junto a la identidad;
- título: aparece bajo el nombre;
- color/acento: se reservará para artículos futuros y no se mostrará como comprado si todavía no existe en el modelo.

Los puntos se obtendrán únicamente de logros desbloqueados que Steam devuelva. La vista debe distinguir sincronización, datos parciales y estado local sin presentar los cosméticos como objetos de Steam.

### Cap. 3 — Store, navegación y movimiento

Store conservará ofertas reales de Steam, pero se reorganizará en un layout consistente: encabezado, estado de conexión/cache, filas o grid responsive, cards con imagen estable, precio y descuento alineados. Los estados loading, vacío, error y retry tendrán la misma geometría.

La búsqueda de biblioteca y la búsqueda global usarán alturas, padding y alineación vertical compartidos. La barra activa de navegación se moverá con una transición corta y no desplazará el contenido.

El shell adoptará una superficie oscura redondeada con glass ligero: borde translúcido, blur moderado, sombras suaves y capas violetas discretas. Las animaciones serán de entrada, hover, selección y transición entre vistas; `prefers-reduced-motion` y la preferencia interna de movimiento las limitarán de forma consistente.

## Componentes y responsabilidades

- `SmartImage`: carga, fallback, placeholder y proporción segura.
- `HeroBanner`, `GameCard`, `GameCarousel`, `StoreView`: consumen assets sin inventar URLs ni deformarlos.
- `PublicProfileView`: presentación pública de identidad, estadísticas, logros, juegos y cosméticos equipados.
- `ProfileStoreView`: catálogo, saldo, compra, equipamiento y estados de la tienda local.
- `AppShell` y navegación: seleccionan las vistas sin mezclar overlays con páginas completas.
- `domain/profile.ts` y `domain/storage.ts`: reglas puras de puntos, compra, equipamiento, normalización y persistencia versionada.
- `index.css` y presets de movimiento: tokens visuales, geometría del shell, responsive y reducción de movimiento.

## Flujo de datos

1. Aevora carga el estado local versionado.
2. Si existe una conexión Steam válida, sincroniza biblioteca, noticias y logros con los adaptadores actuales.
3. Los logros nuevos actualizan puntos de forma determinista y sin duplicados.
4. La tienda local lee el catálogo de artículos y aplica compras/equipamiento al estado persistido.
5. La vista pública consume el mismo estado normalizado, pero no expone controles de edición en modo visitante.
6. La Store de Steam consume únicamente ofertas públicas reales y nunca reutiliza artículos cosméticos locales.

## Estados de error y accesibilidad

- Asset inválido: fallback siguiente y placeholder, sin imagen rota.
- Steam sin conexión: cache o estado explicativo; nunca cards falsas.
- Logros parciales: se muestran los recibidos y se informa cuántos juegos no respondieron.
- Perfil sin datos: identidad por defecto y estado editable, sin romper la vista.
- Compra inválida: saldo insuficiente o artículo inexistente no cambia el estado.
- Todas las vistas mantienen foco visible, nombres accesibles, controles de teclado y `prefers-reduced-motion`.

## Verificación y commits

Cada capítulo tendrá su propio ciclo: prueba que falla, implementación mínima, suite completa y commit solo con evidencia.

1. `fix: stabilize Steam artwork and shell alignment`
2. `feat: add public profile and local cosmetics store`
3. `style: refine Aevora shell and navigation motion`

Antes del último commit se ejecutarán `npm test`, `cargo test --manifest-path src-tauri/Cargo.toml`, `npm run build`, `npm run tauri:build` y `git diff --check`. La verificación visual comprobará home, Store, búsqueda, perfil owner, perfil visitor y tienda con assets cargados y fallidos.
