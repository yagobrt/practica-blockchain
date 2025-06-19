# Instalación del proyecto P2P Bank dApp

## Requisitos previos
- Node.js v20+ y npm
- SQLite 3 y sqlcipher
- Clave privada de cuenta de Ethereum (en Sepolia testnet)
- Cuenta en Infura (para RPC en Sepolia)

---

# Instrucciones paso a paso
## 1. Clonar el repositorio
```sh
git clone https://github.com/yagobrt/practica-blockchain.git
cd practica-blockchain
```

## 2. Instalar las dependencias
Las dependencias están definidas en el archivo `npm-packages.json`
```sh
npm install
```

## 3. Configurar las variables de entorno
```sh
cp .env.example .env
```
Edita el archivo `.env` con tus claves y datos

```env
METAMASK_API_KEY=
INFURA_API_URL=https://sepolia.infura.io/v3/clave_de_infura
ETHERSCAN_API_KEY=clave_de_etherscan
DEPLOYER_PRIVATE_KEY=clave_de_infura_para_depliegue
 Estas contraseñas se pueden generar de forma aleatoria
# o poner lo que tú quieras realmente
DB_USERS_PASSWORD=clave_cifrado_para_la_BBDD_de_clientes   # users.db
DB_LOANS_PASSWORD=clave_cifrado_para_la_BBDD_de_prestamos  # loans.db
# Rellenar una vez desplegado el contrato
LOAN_CONTRACT_ADDRESS=direccion_del_contrato_en_la_blockchain
# Estos se pueden dejar así, asegurandose de que los archivos se llaman igual
CERT_KEY_PATH="./secrets/priv-key.pem"
CERT_PEM_PATH="./secrets/cert.pem"
PUBL_KEY_PATH="./secrets/publ-key.pem"
PRIV_KEY_PATH="./secrets/priv-key.pem"
PORT=3000
```

### Generar las claves
El proyecto usa criptografía de clave pública para la autenticación de los mensajes
que envía el servidor.
Usanndo `openssl` se puede crear el par de claves que el servidor usará.
El programa espera que estas claves se encuentren en `secrets/`
```sh
mkdir secrets/
cd secrets/
# Generar clave privada
openssl genpkey -algorithm RSA -out private-key.pem -pkeyopt rsa_keygen_bits:4096

# Derivar clave pública
openssl rsa -in private-key.pem -pubout -out public-key.pem
```

Con estas claves el servidor firmará los mensajes/emails que se envían a los usuarios
con notificaciones y ,
almacenados en `backend/emails/`.

## 4. Desplegar el contrato
```sh
npm hardhat ...
node scripts/deploy.js
```

## 5 Ejecutar la apliación
```sh
node backend/server.js
```
Esto iniciará un servidor en http://localhost:3000 o en el puerto especificado en el archivo `.env`

