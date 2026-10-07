# Dependencias completas para compilar.
FROM node:24-bookworm-slim AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Compilación y poda de dependencias de desarrollo.
FROM dependencias AS construccion
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# Imagen final: solo JavaScript compilado y dependencias de producción.
FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=construccion --chown=node:node /app/package.json ./
COPY --from=construccion --chown=node:node /app/node_modules ./node_modules
COPY --from=construccion --chown=node:node /app/dist ./dist
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
