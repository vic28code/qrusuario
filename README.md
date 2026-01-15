# Sistema Turnero – Interfaz Usuario (QR)

**Empresa: HANGAROA**

## Descripción

Este proyecto corresponde a la **interfaz web orientada al usuario final**, a la cual se accede mediante el **escaneo de un código QR único** impreso en el ticket de turno.
Cada código QR está asociado a un turno específico, permitiendo al usuario consultar en tiempo real la información correspondiente a su atención.

La página muestra de forma clara los **datos del turno**, el **estado actual**, el **número de personas en espera**, el **turno en atención** y **recomendaciones útiles** mientras el usuario aguarda, mejorando la transparencia y la experiencia del cliente.

---

## Recursos necesarios

Para clonar el repositorio y ejecutar el proyecto localmente, se requiere:

* **Node.js** (versión recomendada: LTS)
* **npm**
* **Git**

Editor de código recomendado:

* Visual Studio Code

---

## Ejecución del proyecto (clonado)

Siga los pasos a continuación para ejecutar el proyecto en entorno local:

```sh
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# Ingresar al directorio del proyecto
cd <NOMBRE_DEL_PROYECTO>

# Instalar dependencias
npm install

# Ejecutar el proyecto en modo desarrollo
npm run dev
```

Una vez iniciado, el sistema podrá ser accedido desde el navegador mediante la URL generada, simulando el acceso del usuario tras escanear el código QR.

---

## Funcionalidad principal

* Visualización del **número de turno**
* Estado del turno (en espera, en atención, finalizado)
* Información de la atención actual
* Cantidad estimada de turnos por delante
* Recomendaciones y mensajes informativos para el usuario
* Acceso mediante **QR único por turno**

---

## Tecnologías utilizadas

* Vite
* React
* TypeScript
* Tailwind CSS
* shadcn-ui

