FROM node:22-alpine

# Install openssl for certificate generation
RUN apk add --no-cache openssl

WORKDIR /app

COPY ./app/package*.json ./

RUN npm install 

COPY ./app/ ./

RUN npx prisma generate --schema ./src/prisma/schema.prisma

RUN npm run build

ENV NODE_ENV=production

EXPOSE 8081

# Copy startup script that generates SSL certificates
COPY ./start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create SSL certificate directories
RUN mkdir -p /etc/ssl/private /etc/ssl/certsdd

CMD ["/app/start.sh"]