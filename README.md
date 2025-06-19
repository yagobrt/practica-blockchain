# practica-blockchain
Código del proyecto principal para la asignatura de *BlockChain y Tecnologías de Seguridad* del
[Máster Universitario en Tecnologías del Sector Financiero: Fintech](https://www.uc3m.es/master/fintech)

## Descripción y características principales
La aplicación permite a los usuarios automatizar la creación de transacciones
en la testnet Ethereum Sepolia, para la creación de prestamos entre pares (P2P).

- Registro y autenticación de usuario
- Creación y aceptación de préstamos entre carteras Ethereum
- Despliegue de contratos inteligentes en Sepolia (Ethereum testnet)
- Firma criptográfica de mensajes
- Bases de datos SQLite cifradas para proteger la información sensible
- Interfaz web intuitiva y moderna

## Tecnologías usadas
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Blockchain:** Solidity, Hardhat, ethers.js
- **Base de datos:** SQLite (cifrada)


## Instalación
Consulta el archivo [`INSTALL.md`](./INSTALL.md) para instruacciones detalladas
sobre cómo instalar y ejecutar el proyecto en tu sistema local.

## Licencia
Este proyecto está liecenciado bajo los términos de la [GNU GPL v3.0](./LICENSE)

---

**Este es un proyecto con fines académicos pensado para ser desplegado en un entorno local y una red de prueba.**

## Estructura del proyecto
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

