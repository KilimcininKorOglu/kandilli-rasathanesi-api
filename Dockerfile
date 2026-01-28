FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 7979 7980

ENV NODE_ENV=PROD

CMD ["dumb-init", "node", "index.js"]
