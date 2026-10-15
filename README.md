# Aevora

Lanzador de videojuegos para Windows enfocado en la integración con Steam, rendimiento ligero y una interfaz limpia. Construido con React, TypeScript, Tailwind CSS y Tauri 2 (Rust).

---

## Descargas (Windows 64-bit)

[![Descargar para Windows](https://img.shields.io/badge/Descargar-Windows%20(64--bit)-0078D4?style=flat-square&logo=windows&logoColor=white)](https://github.com/AndrehhX/Aevora/releases/latest/download/Aevora_0.1.0_x64-setup.exe)
[![Versión](https://img.shields.io/github/v/release/AndrehhX/Aevora?style=flat-square&color=10B981&label=Release)](https://github.com/AndrehhX/Aevora/releases/latest)

* **[Instalador recomendado (.exe)](https://github.com/AndrehhX/Aevora/releases/latest/download/Aevora_0.1.0_x64-setup.exe)** — Instalador estándar con soporte de actualizaciones automáticas.
* **[Paquete MSI (.msi)](https://github.com/AndrehhX/Aevora/releases/latest/download/Aevora_0.1.0_x64_en-US.msi)** — Para instalaciones silenciosas o entornos administrados.
* **[Releases en GitHub](https://github.com/AndrehhX/Aevora/releases/latest)** — Historial de versiones y notas de cambios.

> Las actualizaciones se descargan e instalan automáticamente desde GitHub cuando hay una nueva versión disponible.

---

## Características

* **Integración con Steam**: Sincroniza tu biblioteca real mediante tu Steam ID y API Key. Si no conectas una cuenta, la biblioteca permanece vacía sin datos ficticios.
* **Almacenamiento seguro**: Las credenciales se guardan de forma nativa en el Administrador de Credenciales de Windows (Credential Manager), nunca en local storage ni texto plano.
* **Arte en alta resolución**: Carga carátulas y fondos HD directamente desde los servidores de contenido de Steam con redundancia de CDN.
* **Lanzamiento directo**: Abre juegos instalados a través del protocolo nativo del cliente de Steam.
* **Actualizaciones automáticas**: Sistema de firmas criptográficas (Minisign) integrado con GitHub Releases.

---

## Tecnologías

* **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
* **Backend nativo**: Tauri 2, Rust (Windows API, Credential Manager, Minisign)
* **Testing**: Vitest (67 pruebas unitarias y de integración)
* **CI/CD**: GitHub Actions para compilación, firma y publicación de releases

---

## Desarrollo local

### Requisitos previos
* Node.js 18+ y npm
* Rust y herramientas de compilación de C++ (MSVC / Windows SDK)
* WebView2 (instalado por defecto en Windows 10/11)

### Comandos

```bash
# Instalar dependencias
npm install

# Modo desarrollo (interfaz web)
npm run dev

# Modo desarrollo (aplicación de escritorio)
npm run tauri:dev

# Ejecutar pruebas
npm test

# Verificación completa (TypeScript + Tests + Build)
npm run check

# Compilar instalador de producción
npm run tauri:build
```

---

## Estructura del proyecto

```text
src/
  components/       Componentes de interfaz (GameCard, HeroBanner, Settings, etc.)
  domain/           Modelos de datos para biblioteca, perfil y estado
  integrations/     Clientes para Steam API, caché local y puente Tauri
  views/            Vistas principales (Biblioteca, Tienda, Comunidad, Perfil)
src-tauri/          Backend en Rust, integración con Windows y configuración de Tauri
tests/              Pruebas unitarias y de integración
.github/workflows/  Pipeline de compilación y publicación automática
```
