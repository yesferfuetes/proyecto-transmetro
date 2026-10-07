# Dependencias completas para construir.
FROM node:24-bookworm-slim AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Construcción con salida standalone (incluye los archivos estáticos).
FROM dependencias AS construccion
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

# Imagen final: solo el servidor standalone.
FROM node:24-bookworm-slim
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /app
COPY --from=construccion --chown=node:node /app/.next/standalone ./
USER node
EXPOSE 3000
CMD ["node", "server.js"]
