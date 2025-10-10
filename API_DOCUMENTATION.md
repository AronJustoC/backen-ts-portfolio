# Documentación de la API

Esta documentación describe cómo interactuar con la API, incluyendo la autenticación,
los endpoints disponibles y cómo gestionar variables en la terminal `fish`.

## Autenticación

Para acceder a los endpoints protegidos, primero debes registrar un usuario
y luego iniciar sesión para obtener un token de acceso.

### 1. Registrar un Nuevo Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}'
```

### 2. Iniciar Sesión

Después de registrarte, inicia sesión para obtener un `accessToken` y un `refreshToken`.

```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123"
}'
```

La respuesta incluirá el `accessToken` y el `refreshToken`. Para los siguientes ejemplos, asumiremos que has guardado estos tokens en variables de entorno (`$ACCESS_TOKEN` y `$REFRESH_TOKEN`).

## Endpoints de la API

A continuación se muestran los endpoints disponibles.
Las solicitudes a endpoints protegidos requieren un `accessToken`.

### Endpoints de Autenticación

#### Refrescar Sesión

Usa el `REFRESH_TOKEN` para obtener un nuevo par de tokens.

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
-H "Content-Type: application/json" \
-d '{
  "refreshToken": "$REFRESH_TOKEN"
}'
```

### Endpoints de Usuario (Protegidos)

Para todas las siguientes solicitudes, asegúrate de tener el `$ACCESS_TOKEN` definido.

#### Obtener Todos los Usuarios

```bash
curl -X GET http://localhost:3000/api/users \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Obtener un Usuario por ID

```bash
# Reemplaza 1 con el ID del usuario que quieres consultar
curl -X GET http://localhost:3000/api/users/1 \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Actualizar un Usuario

```bash
# Reemplaza 1 con el ID del usuario que quieres actualizar
curl -X PATCH http://localhost:3000/api/users/1 \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $ACCESS_TOKEN" \
-d '{
  "bio": "Una nueva biografía para el usuario."
}'
```

#### Eliminar un Usuario

```bash
# Reemplaza 1 con el ID del usuario que quieres eliminar
curl -X DELETE http://localhost:3000/api/users/1 \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

### Endpoints de Posts (Protegidos)

Para todas las siguientes solicitudes, asegúrate de tener el `$ACCESS_TOKEN` definido.

#### Crear un nuevo Post

```bash
curl -X POST http://localhost:3000/api/posts \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $ACCESS_TOKEN" \
-d '{
  "title": "Mi primer Post desde cURL",
  "content": "Este es el contenido de mi post, creado usando cURL.",
  "slug": "mi-primer-post-curl"
}'
```

#### Obtener todos los Posts

```bash
curl -X GET http://localhost:3000/api/posts \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Obtener un Post por su ID

Reemplaza `:id` con el ID del post que creaste.

```bash
curl -X GET http://localhost:3000/api/posts/:id \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Actualizar un Post

Reemplaza `:id` con el ID del post que quieres actualizar.

```bash
curl -X PATCH http://localhost:3000/api/posts/:id \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $ACCESS_TOKEN" \
-d '{
  "title": "Mi Post Actualizado",
  "content": "El contenido ha sido actualizado."
}'
```

#### Eliminar un Post

Reemplaza `:id` con el ID del post que quieres eliminar.

```bash
curl -X DELETE http://localhost:3000/api/posts/:id \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

### Endpoints de Proyectos (Protegidos)

Para todas las siguientes solicitudes, asegúrate de tener el `$ACCESS_TOKEN` definido.

#### Crear un nuevo Proyecto

```bash
curl -X POST http://localhost:3000/api/projects \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $ACCESS_TOKEN" \
-d '{
  "title": "Mi primer Proyecto desde cURL",
  "description": "Este es el contenido de mi proyecto, creado usando cURL.",
  "imageUrl": "http://example.com/image.png",
  "repoUrl": "http://github.com/user/repo",
  "liveUrl": "http://example.com"
}'
```

#### Obtener todos los Proyectos

```bash
curl -X GET http://localhost:3000/api/projects \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Obtener un Proyecto por su ID

Reemplaza `:id` con el ID del proyecto que creaste.

```bash
curl -X GET http://localhost:3000/api/projects/:id \
-H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Actualizar un Proyecto

Reemplaza `:id` con el ID del proyecto que quieres actualizar.

```bash
curl -X PATCH http://localhost:3000/api/projects/:id \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $ACCESS_TOKEN" \
-d '{
  "title": "Mi Proyecto Actualizado",
  "description": "El contenido ha sido actualizado."
}'
```

#### Eliminar un Proyecto

Reemplaza `:id` con el ID del proyecto que quieres eliminar.

```bash
curl -X DELETE http://localhost:3000/api/projects/:id \
-H "Authorization: Bearer $ACCESS_TOKEN"
```
