# Backend 

# Proyecto de Boda - Guía de Uso

## Cambios recientes en la app para implementar la DB
1. debes de crear un archivo .env en la carpeta raiz
2. Copia en el archivo .env los siguientes datos
```bash
# Configuración del servidor
PORT=2002
NODE_ENV=development

# Configuración de MongoDB
MONGODB_URI=URLMONGO
```
3. Corre el proyecto. Para ello necesitas usar los puntos 2, 3, y 4. 

### Tecnologias usadas
* NodeJS
* MongoDB

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- GIT
- Un editor de texto
- Postman

## 1. Clonar el Repositorio

Para obtener una copia del proyecto en tu computadora, abre la terminal y ejecuta:

```bash
git clone https://github.com/cesarcamilov1/boda-jordi-brenda.git
```

## 2. Actualizar los cambios mas recientes que se suba

Para obtener los cambios mas recientes del proyecto, en una terminal manda el commando de:

```bash
git pull origin master
```

## 3. Descargar las librerias necesarias 

```bash
npm install
```

## 4. Ejecutar el proyecto
Cada vez que quieras ejectuar el proyecto necesitas solo ejecutar el comando de la parte inferior, solo eso

```bash
npm run dev
```

### Notas adicionales 
Cuando se necesiten bajar los cambios mas recientes que te o comente lo que tienes que hacer es ejecutar los comandos desde el punto numero 2 al 4.

### Como saber que esta funcionando bien
En la consola donde hayas corrido el comando del punto 4 te debe aparecer en la parte inferior: Server is running on port 2002 y is consultas la 
url de http://localhost:2002/ te debe de aparecer Que vivan los novios xdxd .API.

### Notas del editor 
Es el avance que se tiene, te recomiendo que lo ejecutes y una vez que tengas las demas cosas me avises para enviar los cambios y no te satures.




