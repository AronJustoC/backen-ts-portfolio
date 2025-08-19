# Documentación de la API

Esta documentación describe cómo interactuar con la API, incluyendo la autenticación, los endpoints disponibles y cómo gestionar variables en la terminal `fish`.

## Autenticación

Para acceder a los endpoints protegidos, primero debes registrar un usuario y luego iniciar sesión para obtener un token de acceso.

### 1. Registrar un Nuevo Usuario

```fish
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}'
```

### 2. Iniciar Sesión y Almacenar Tokens

Después de registrarte, inicia sesión para obtener un `accessToken` y un `refreshToken`. El siguiente comando extrae ambos tokens y los guarda en variables de entorno de `fish`.

```fish
# Realiza la petición y guarda la respuesta
set response (curl -s -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123"
}')

# Extrae los tokens usando jq y los guarda en variables globales
set -gx ACCESS_TOKEN (echo $response | jq -r '.token.token')
set -gx REFRESH_TOKEN (echo $response | jq -r '.token.refresh_token')

# Verifica que los tokens se hayan guardado
echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"
```

## Uso de Variables en la Terminal Fish

En `fish`, las variables de entorno se gestionan con el comando `set`. Para que una variable esté disponible en todas las sesiones de la terminal, se utiliza el flag `-gx` (global y exportable).

- **Definir una variable**: `set -gx NOMBRE_VARIABLE "valor"`
- **Usar una variable**: `$NOMBRE_VARIABLE`

## Endpoints de la API

A continuación se muestran los endpoints disponibles. Las solicitudes a endpoints protegidos requieren un `accessToken`.

### Endpoints de Autenticación

#### Refrescar Sesión

Usa el `REFRESH_TOKEN` para obtener un nuevo par de tokens.

```fish
curl -X POST http://localhost:3000/api/auth/refresh \
-H "Content-Type: application/json" \
-d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

### Endpoints de Usuario (Protegidos)

Para todas las siguientes solicitudes, asegúrate de tener el `$ACCESS_TOKEN` definido.

#### Obtener Todos los Usuarios

```fish
curl -X GET http://localhost:3000/api/users \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Obtener un Usuario por ID

Primero, define el ID del usuario que quieres consultar.

```fish
set -gx USER_ID 1 # Reemplaza 1 con el ID real

curl -X GET http://localhost:3000/api/users/$USER_ID \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Actualizar un Usuario

```fish
curl -X PATCH http://localhost:3000/api/users/$USER_ID \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $ACCESS_TOKEN" \
-d '{
  "bio": "Una nueva biografía para el usuario."
}'
```

#### Eliminar un Usuario

```fish
curl -X DELETE http://localhost:3000/api/users/$USER_ID \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Eliminar las variables de terminal fish

```bash
Eliminar el access token
set -e ACCESS_TOKEN
# Eliminar el refresh token
set -e REFRESH_TOKEN
# Eliminar el ID de usuario
set -e USER_ID
```
