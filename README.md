# Aevora Launcher

Aevora es un lanzador de videojuegos de escritorio (*game launcher*) unificado con enfoque *desktop-first*, diseño *Super Premium* y una arquitectura desacoplada y honesta. La interfaz está construida con React 18, TypeScript y Tailwind CSS sobre animaciones fluidas con Framer Motion; la capa nativa y segura corre sobre Tauri 2 y Rust. Sin un proveedor conectado (actualmente Steam), la biblioteca se mantiene vacía de forma transparente en lugar de mostrar juegos ficticios.

---

## 🚀 Descarga y Ejecutables (Windows 64-bit)

[![Descargar Aevora para Windows](https://img.shields.io/badge/Descargar%20Aevora-Windows%20(64--bit)-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/AndrehhX/Aevora/releases/latest/download/Aevora_0.1.0_x64-setup.exe)
[![Última Versión](https://img.shields.io/github/v/release/AndrehhX/Aevora?style=for-the-badge&color=10B981&label=Versi%C3%B3n)](https://github.com/AndrehhX/Aevora/releases/latest)

Haz clic directamente en el instalador para descargarlo:

* **[⬇️ Descargar Instalador Recomendado (Aevora_0.1.0_x64-setup.exe)](https://github.com/AndrehhX/Aevora/releases/latest/download/Aevora_0.1.0_x64-setup.exe)**
  *(Asistente de instalación estándar para Windows con soporte de auto-actualización)*
* **[⬇️ Descargar Paquete Windows Installer (.msi)](https://github.com/AndrehhX/Aevora/releases/latest/download/Aevora_0.1.0_x64_en-US.msi)**
  *(Instalador corporativo para despliegues desatendidos o directivas de grupo)*
* **[📦 Ver todas las descargas y notas de versión en GitHub Releases](https://github.com/AndrehhX/Aevora/releases/latest)**

> [!TIP]
> **Actualizaciones automáticas:** Una vez instalado, Aevora comprobará automáticamente nuevas versiones en GitHub y se actualizará solo sin que tengas que volver a descargar nada manualmente.

---


## 💎 Características y Calidad Super Premium

* **Pipeline de Arte Multi-CDN en Ultra Alta Resolución**:
  * Resolución inteligente de carátulas 2x (`library_600x900_2x.jpg` a 1200×1800) y panorámicas HD (`library_hero.jpg` a 1920×620).
  * Redundancia entre Cloudflare CDN y Akamai CDN para eliminar fallos por saturación o caídas de red.
  * **Atmospheric Nebula Mesh Hero**: Si la red no estuviese disponible, la aplicación genera un fondo ambiental procedimental con resplandor en lugar de cajas negras o imágenes rotas.
* **Diseño Glassmorphism y Profundidad**:
  * Marcos multicapa con reflejos especulares de luz superior.
  * Animaciones de física natural orgánica (`cubic-bezier(0.16, 1, 0.3, 1)`) que eliminan la rigidez.
  * Tarjetas de juego con indicador activo de instalación (*emerald spark*) y halo luminoso reactivo.
* **Seguridad Absoluta de Credenciales**:
  * La API key de Steam nunca se almacena en el navegador ni en variables web; se guarda de forma nativa en el **Administrador de Credenciales de Windows** (*Windows Credential Manager*).
* **Lanzamiento Nativo Directo**:
  * Lanzamiento de juegos mediante protocolo seguro `steam://rungameid/<appid>`.

---

## 🛠️ Requisitos de Desarrollo en Windows

* Node.js LTS (v18+) y npm
* Git
* Microsoft C++ Build Tools (con SDK de Windows y MSVC)
* Microsoft Edge WebView2 Runtime
* Rust (`stable-x86_64-pc-windows-msvc`)

---

## 💻 Comandos de Desarrollo

Instalar dependencias:
```bash
npm install
```

Iniciar entorno de desarrollo web en navegador:
```bash
npm run dev
```

Iniciar entorno de desarrollo nativo de escritorio (Tauri):
```bash
npm run tauri:dev
```

Ejecutar suite de pruebas (Vitest):
```bash
npm test
```

Verificación completa (TypeScript + Tests + Build):
```bash
npm run check
```

Compilar instalador y ejecutables de producción:
```bash
npm run tauri:build
```

---

## 📂 Mapa del Proyecto

```text
src/domain/                  Modelos canónicos de juegos, perfil y almacenamiento
src/integrations/cache/     Almacén de caché con expiración TTL y control de estado obsoleto
src/integrations/steam/     Normalizador y adaptador de APIs públicas de Steam
src/integrations/desktop/   Puente tipado y seguro con comandos de Tauri
src/components/             Componentes UI: HeroBanner, GameCard, GameDetails, Sidebar, etc.
src/views/                  Vistas principales: Biblioteca, Tienda Steam, Comunidad y Perfil
src-tauri/                  Backend nativo en Rust: comandos de lanzamiento y Windows Credential Manager
tests/                      Pruebas unitarias de dominio, integración y accesibilidad
.github/workflows/          Automatización de releases y auto-actualizaciones con GitHub Actions
```
