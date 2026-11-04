# dónde dejé el auto

Una web app de una sola pantalla para guardar dónde estacionaste el auto y después
volver a encontrarlo. Tocás un llavero NFC contra el teléfono al bajarte (guarda el
punto) y lo volvés a tocar cuando querés encontrarlo (ves la distancia y una flecha
que apunta hacia el auto).

Es un proyecto de portfolio, gratuito y público. Cualquiera puede usarlo taggeando
su propio llavero: no hace falta ninguna cuenta ni backend.

## Qué NO hace (a propósito)

- No tiene backend, base de datos ni API: todo corre en el navegador.
- No tiene cuentas, login ni identificadores de usuario.
- **No guarda ningún dato fuera del teléfono.** Los puntos (latitud, longitud,
  momento en que se guardaron y precisión del GPS) se guardan únicamente en el
  `localStorage` del navegador del teléfono, bajo la clave `auto:puntos`. Esa
  información nunca sale del dispositivo: no hay servidor que la reciba, no hay
  analytics, no hay cookies ni tracking de terceros. Se guardan como máximo 5
  puntos; borrar los datos del sitio en el navegador borra todo.
- No es una PWA ni tiene service worker: la entrada es el llavero NFC, no hace
  falta instalar nada.
- No tiene mapa embebido: para ver el punto en el mapa se abre Google Maps en
  una pestaña nueva.

## Preparar el llavero NFC

La página `/como-funciona` (link discreto al pie de la app) tiene el instructivo
completo, pero en resumen:

1. Conseguí un llavero NFC NTAG213 o NTAG215 (se consiguen baratos en Mercado Libre).
2. Instalá la app **NFC Tools** (gratis, Android y iPhone).
3. En NFC Tools, entrá en **Escribir**, agregá un registro de tipo **URL** y pegá
   la dirección donde esté publicada esta app (por ejemplo,
   `https://donde-deje-el-auto.vercel.app`).
4. Tocá **Escribir** y apoyá el llavero contra la parte de atrás del teléfono
   hasta que la app avise que terminó.
5. Probalo: tocá el llavero con el teléfono y tiene que abrirse esta misma app.

El llavero va en el llavero de las llaves del auto, **no pegado al auto**: así el
mismo tag sirve tanto para guardar el punto (al bajarte) como para consultarlo
(al volver).

## Correr el proyecto en local

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`. Como usa geolocalización y
`deviceorientation`, conviene probarla desde un teléfono real conectado a la
misma red (o exponiendo el puerto con alguna herramienta de túnel), ya que esos
permisos los pide el navegador del dispositivo.

Otros scripts disponibles:

```bash
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint    # corre ESLint (eslint-config-next)
```

## Deployar en Vercel

El proyecto es un Next.js estándar (App Router), así que el deploy en
[Vercel](https://vercel.com) no necesita configuración adicional:

1. Importá el repositorio en Vercel (New Project → Import Git Repository).
2. Vercel detecta automáticamente que es Next.js; no hace falta tocar ningún
   build command, output directory ni variable de entorno.
3. Deploy. La URL que te da Vercel es la que vas a escribir en el llavero NFC
   (ver sección anterior).

No hay variables de entorno ni secretos que configurar: la app no habla con
ningún servicio externo.

## Stack

- Next.js (App Router) + TypeScript
- Tipografía Barlow y Barlow Condensed vía `next/font/google`
- CSS Modules propio (sin librerías de UI)
- Persistencia en `localStorage` del navegador

## Licencia

[MIT](./LICENSE) © 2026 Matías Ezequiel De Cesare
