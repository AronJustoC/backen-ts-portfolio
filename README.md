# Proyecto backend para portafolio personal

## node_tsx

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Configuraciones iniciales para el Proyecto para el formato

Para eslint y sera necesario comandos para evitar conflictos con prettier

```bash
bun add -d eslint @typescript-eslint/parser
@typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-prettier
```

Procedemos a inicializar el Proyecto con este comando:

```bash
bun x eslint --init
```

Luego se crea el .prettierrc.json deberia ser algo asi:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

Tambien sera necesario el instalar commitlint y
husky para tener control sobre el formato de los commits

```bash
bun add -d @commitlint/cli @commitlint/config-conventional husky
```

gaaaaaaaaaaaaaa
