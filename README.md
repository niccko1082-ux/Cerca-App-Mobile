# Cerca - App Mobile 📱

**Cerca** es una aplicación móvil desarrollada en React Native y Expo que funciona como un Marketplace de Servicios Locales de dos caras, permitiendo conectar a clientes locales con proveedores de servicios de confianza (carpintería, aire acondicionado, etc.).

---

## 📥 Descarga de la APK (Android)

Puedes descargar la versión de previsualización (APK) directamente en tu dispositivo Android a través del siguiente enlace público sin inconvenientes:

* **[Descargar APK Directa (Expo Artifacts)](https://expo.dev/artifacts/eas/DCvkUa6g0B60Ya1BUWCG9bd8mBSXSo3Lcbg7cIKlyi4.apk)**
* **[Historial de Builds y Descargas en Expo Dashboard](https://expo.dev/accounts/maribeth3112/projects/cerca/builds)**

---

## 🛠️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado y configurado lo siguiente:

1. **Node.js** (Versión 18.x o superior).
2. **npm** (Viene integrado con Node.js) o **yarn**.
3. **Dispositivo Móvil / Emulador:**
   * Dispositivo físico Android/iOS con la aplicación **Expo Go** instalada (disponible en Play Store y App Store).
   * O bien, un emulador Android (Android Studio) o simulador iOS (Xcode) configurado en el sistema.
4. **Red Local:** El dispositivo físico y tu computadora de desarrollo deben estar conectados a la **misma red WiFi** para que la app móvil pueda consumir el backend local.

---

## 🚀 Pasos para Levantar el Proyecto

Sigue estos sencillos pasos para iniciar el entorno de desarrollo:

### 1. Instalar las dependencias
Abre la terminal en la raíz del proyecto y ejecuta:
```bash
npm install
```

### 2. Configurar las Variables de Entorno
Copia el archivo de plantilla `.env.example` para crear tu archivo `.env` de desarrollo local:
```bash
cp .env.example .env
```
Abre el archivo `.env` recién creado y configura la variable `EXPO_PUBLIC_API_URL` utilizando la dirección IP local de tu computador y el puerto del backend (generalmente `3333`):
```env
EXPO_PUBLIC_API_URL=http://<TU_IP_LOCAL>:3333
```
> **Nota:** Para conocer tu dirección IP local en Mac/Linux ejecuta `ifconfig` o en Windows ejecuta `ipconfig` en la consola. Evita usar `localhost` o `127.0.0.1` si vas a probar en un dispositivo físico.

### 3. Iniciar el Servidor de Desarrollo
Para levantar el servidor de desarrollo de Expo, ejecuta:
```bash
npx expo start
```
* **Dispositivo Físico:** Escanea el código QR que se visualiza en la terminal usando la cámara de tu celular (iOS) o la app Expo Go (Android).
* **Emulador Android:** Presiona la tecla `a` en la consola.
* **Simulador iOS:** Presiona la tecla `i` en la consola.

---

## ⚙️ Comandos del Proyecto

El proyecto incluye scripts configurados para mantener la calidad y verificar el correcto funcionamiento del código:

* **Iniciar en modo desarrollo:** `npm run dev`
* **Ejecutar Pruebas Unitarias:** `npm run test` (ejecuta Vitest para verificar políticas de negocio y adapters).
* **Ejecutar Linter:** `npm run lint` (verifica errores de estilo y buenas prácticas).
* **Auto-formatear código con Prettier:** `npm run format`
* **Script de verificación completa:** `./scripts/verify.sh` (ejecuta TypeScript, Prettier, ESLint y pruebas unitarias de una sola vez).

---

## 👥 Integrantes del Proyecto

Este proyecto fue desarrollado y configurado por:

* **Nicolás Agudelo**
* **Maribel Castañeda**
