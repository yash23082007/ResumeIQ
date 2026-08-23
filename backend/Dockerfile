FROM node:20-slim

WORKDIR /app

# System dependencies for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["node", "src/index.js"]
