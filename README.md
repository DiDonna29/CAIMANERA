# Caimanera Elite | Tournament Randomizer V1.0

Organiza tus partidos con el motor de sorteos más avanzado. Estética profesional para tus encuentros amateur.

## 🏆 Descripción
Caimanera Elite es una herramienta diseñada para apasionados del fútbol que buscan organizar sus partidos de forma profesional. Permite realizar sorteos aleatorios, llevar estadísticas de victorias persistentes y generar pósteres de alta calidad para compartir en redes sociales.

## ✨ Características
- **Sorteo Inteligente**: Algoritmo para una aleatoriedad perfecta y equipos equilibrados.
- **Varios Formatos**: Soporte para 2v2, 3v3, 5v5, 7v7 y 11v11.
- **Sincronización por Código**: Comparte tu sorteo con otros dispositivos mediante códigos cifrados.
- **Persistencia Local**: Tus datos se guardan en el navegador automáticamente mediante LocalStorage.
- **Reporte de Campeones**: Genera un Top 3 basado en victorias acumuladas durante la jornada.
- **Exportación de Imágenes**: Descarga los resultados en formato PNG con diseño de alta competición.
- **Estética John Di Donna**: Interfaz oscura premium con efectos de brillo y vidriomorfismo.

## 🚀 Instalación y Desarrollo

### Requisitos previos
- Node.js 18+
- Gestor de paquetes (pnpm recomendado, o npm/yarn)

### Paso 1: Instalación de dependencias
```bash
# Con pnpm (recomendado)
pnpm install

# Con npm
npm install
```

### Paso 2: Servidor de desarrollo
Para iniciar la aplicación localmente:
```bash
pnpm dev
# o
npm run dev
```
La aplicación estará disponible en `http://localhost:9002`.

### Paso 3: Construcción para producción
Para preparar la aplicación para el despliegue:
```bash
pnpm build
pnpm start
```

## 🛠️ Tecnologías
- **Framework**: Next.js 15 (App Router)
- **Estilos**: Tailwind CSS + ShadCN UI
- **Gráficos**: html-to-image (para exportación de pósteres)
- **Persistencia**: LocalStorage API + UTF-8 Base64 Sincronización

---
Desarrollado con ❤️ por **John Di Donna**.
