# Aevora Store, Community y perfil local

## Objetivo

Completar las superficies principales de Aevora sin datos de muestra: imágenes de Steam bien encajadas, una Store con ofertas públicas reales, Community agregando noticias de todos los juegos sincronizados y un perfil local personalizable con logros, puntos y una tienda visual.

## Límites funcionales

- La biblioteca sigue viniendo de la cuenta Steam conectada y de los manifiestos locales.
- Las ofertas usan datos públicos de Steam Store. No se simula una recomendación personalizada de la cuenta.
- Community usa anuncios/noticias públicas de `ISteamNews/GetNewsForApp` por juego. La API pública no entrega todas las discusiones privadas ni todo el contenido de los hubs.
- El perfil, los puntos, los artículos comprados y la personalización se guardan localmente. No se modifica el inventario, saldo, perfil ni cuenta de Steam.
- Los logros se consultan solo cuando Steam los expone para ese juego y perfil; juegos privados, sin estadísticas o con respuesta no disponible se omiten sin romper el resto.
- La API key y el SteamID permanecen en el puente nativo y Windows Credential Manager; nunca se imprimen, se incluyen en el bundle web ni se guardan en el repositorio.

## Diseño

### Imágenes

Cada tipo de asset tiene un uso y una proporción fija:

- `cover`: tarjeta vertical, `object-cover`, fallback a una imagen vertical oficial.
- `hero`: banner horizontal, `object-cover`, overlay controlado y altura limitada.
- `logo`: `object-contain`, sin deformación ni recorte.
- `icon`: tamaño pequeño con fallback visual de la aplicación.

El componente de imagen conserva el estado de carga, prueba fallbacks en orden y muestra un placeholder sobrio cuando Steam no devuelve el asset. Ningún layout depende de una imagen para calcular una altura ilimitada.

### Store

El puente nativo consulta `featuredcategories` de Steam Store con `cc=gt` y `l=english`. La respuesta se normaliza a:

```ts
interface SteamStoreOffer {
  appId: number;
  name: string;
  headerImage?: string;
  capsuleImage?: string;
  price?: string;
  originalPrice?: string;
  discountPercent?: number;
  storeUrl: string;
  category: 'featured' | 'specials' | 'top-sellers';
}
```

La vista muestra tres filas reales: destacados, más vendidos y ofertas. Si una categoría no trae juegos, la interfaz explica que Steam no devolvió resultados; no usa IDs de fixtures. Seleccionar una oferta abre la ficha de Steam o un detalle compatible con el launcher.

### Community

Para cada juego de la biblioteca se solicita el feed público de Steam News. El adaptador limita la concurrencia, deduplica por `gid`, ordena por fecha descendente y conserva el origen (`gameTitle`). Los fallos parciales no eliminan las noticias que sí cargaron. El cache conserva el último resultado válido y marca los items stale si la red falla.

### Perfil

El modelo local versionado añade:

- nombre visible, bio, avatar, fondo, marco y color de acento;
- puntos disponibles y puntos ganados;
- logros agregados por aplicación;
- artículos desbloqueados y artículos equipados.

La tienda local tendrá artículos decorativos con precio en puntos: marcos, fondos, insignias y títulos. Se valida saldo antes de comprar y la operación es idempotente. El perfil puede editarse aunque Steam esté desconectado.

Los logros reales se consultan por aplicación mediante `GetPlayerAchievements`. Se cuentan como desbloqueados solo los logros con `achieved=1`; se guardan timestamps y nombres disponibles. El cálculo de puntos es determinista y local, con una recompensa base por logro y sin reclamar dinero ni objetos en Steam.

## Estados y accesibilidad

- Loading, vacío, error parcial, offline/cache y éxito tienen copy visible.
- Las imágenes no producen saltos grandes de layout.
- La navegación y los botones siguen siendo utilizables con teclado.
- `prefers-reduced-motion` desactiva transiciones decorativas nuevas.
- La Store y Community no muestran contenido de ejemplo en producción.

## Verificación de aceptación

1. Una biblioteca conectada llena Store con ofertas reales o con un estado vacío explicado.
2. Community muestra artículos provenientes de más de un juego cuando Steam los devuelve, sin duplicados.
3. Un juego con portada, header y logo puede cambiar de vista sin imagen deformada; un asset fallido usa el siguiente fallback.
4. Perfil puede editarse, comprar un artículo con puntos, equiparlo y conservarlo tras reiniciar.
5. Los logros visibles coinciden con los desbloqueados que devuelve Steam; respuestas privadas/no disponibles no rompen la vista.
6. `npm test`, `cargo test --manifest-path src-tauri/Cargo.toml`, `npm run build`, `npm run tauri build` y `git diff --check` pasan antes del commit final.
