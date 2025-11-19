# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY src ./src

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copiar apenas o necessário para produção
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar o build da stage anterior
COPY --from=builder /app/build ./build

# Expor a porta (ajuste se necessário)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
