# Caimanera Elite | Tournament Randomizer

Organiza tus partidos con el motor de sorteos más avanzado. Estética Champions League para tus encuentros amateur.

## 🏆 Descripción
Caimanera Elite es una herramienta diseñada para apasionados del fútbol que buscan organizar sus partidos de forma profesional. Con un diseño inspirado en la UEFA Champions League, permite realizar sorteos aleatorios, llevar estadísticas de victorias y generar pósteres de alta calidad para compartir.

## ✨ Características
- **Sorteo Inteligente**: Algoritmo Fisher-Yates para una aleatoriedad perfecta.
- **Varios Formatos**: Soporte para 2v2, 3v3, 5v5, 7v7 y 11v11.
- **Persistencia**: Tus datos se guardan en el navegador automáticamente.
- **Reporte de Campeones**: Genera un Top 3 basado en victorias acumuladas.
- **Exportación de Imágenes**: Descarga los resultados en formato PNG para WhatsApp.
- **Modo Oscuro/Claro**: Adaptado a cualquier entorno.

## 🚀 Instalación y Desarrollo

### Requisitos previos
- Node.js 18+
- Un gestor de paquetes (npm, yarn o pnpm)

### Paso 1: Instalación de dependencias
```bash
# Con npm
npm install

# Con yarn
yarn install

# Con pnpm
pnpm install
```

### Paso 2: Servidor de desarrollo
Para iniciar la aplicación localmente:
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```
La aplicación estará disponible en `http://localhost:9002`.

## 📦 Producción
Para preparar la aplicación para el despliegue:

```bash
# Compilar el proyecto
npm run build

# Iniciar en modo producción
npm start
```

## 🛠️ Tecnologías
- **Framework**: Next.js 15 (App Router)
- **Estilos**: Tailwind CSS + ShadCN UI
- **Gráficos**: HTML-to-Image (para exportación de pósteres)
- **Persistencia**: LocalStorage API

---
Desarrollado con ❤️ por **John Di Donna**.
