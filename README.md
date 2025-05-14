# practica-blockchain
Código para la práctica de Blockchain y Tecnologías del sector financiero

## Estructura del proyecto
✨ Gracias ChatGPT 🤖 ✨  
.  
├── contracts/               # Contratos inteligentes en Solidity (incluye pruebas si las hubiera)  
│   ├── HelloWorld.sol         
│   └── ...                  # Otros contratos (por ejemplo, Lending.sol o LoanContract.sol)  
├── scripts/                 # Scripts de Hardhat para desplegar y testear los contratos  
│   ├── deploy.js              
│   └── ...                  # Otros scripts (por ejemplo, interacción post-deploy)  
├── frontend/                # Código del front-end (React)  
│   ├── public/              # Archivos estáticos (index.html, assets, favicon, etc.)  
│   └── src/                   
│       ├── components/      # Componentes de React (botones, formularios, etc.)  
│       ├── pages/           # Páginas o vistas principales de la aplicación  
│       ├── App.js           # Componente raíz de React  
│       └── index.js         # Punto de entrada  
├── backend/                 # Código del back-end (Node.js + Express)  
│   ├── controllers/         # Lógica de negocio (ej.: funciones para gestionar usuarios, préstamos)  
│   ├── models/              # Definición e integración con SQLite (puedes tener subdirectorios para cada base de datos: users, loans)  
│   ├── routes/              # Rutas API REST para interactuar con el front-end y gestionar la lógica del negocio  
│   ├── services/            # Servicios como: envío de notificaciones/email (simulados mediante logs), conexión con la blockchain, cifrado y manejo de claves privadas  
│   ├── utils/               # Utilidades varias (por ejemplo, funciones de hash, validaciones, configuración de logger)  
│   ├── config.js            # Opciones y configuraciones (p. ej.: rutas de bases de datos, configuración de correo, etc.)  
│   ├── app.js               # Configuración y arranque de la aplicación Express (middleware, rutas, etc.)  
│   └── server.js            # Script para iniciar el servidor (conexión a la base de datos, etc.)  
├── secrets/                 # Certificados para firmar y claves públicas y privadas  
├── .env                     # Variables de entorno (por ejemplo, claves privadas, contraseñas, URL de la testnet Sepolia, parámetros de cifrado, etc.)  
├── hardhat.config.js        # Configuración de Hardhat para desplegar contratos en Sepolia  
├── package.json             # Dependencias y scripts de NPM (puede ser único o tener uno separado por cada gran módulo)  
└── README.md                # Documentación del proyecto  

## Para ejecutar el proyecto
Primero instalar las dependencias:
```shell
npm install
```

### Ejecutar el servidor
```shell
node backend/server.js
```
Esto iniciará un servidor en http://localhost:3000 o en el puerto especificado en el archivo `.env`

### Ejecutar el frontend / página web
Abrir un navegador e ir a http://localhost:3000 (o el puerto en el que se haya iniciado), se abrirá la página de registro
