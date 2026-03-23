FROM node:22-alpine

WORKDIR /app

COPY ./app/package*.json ./

RUN npm install 

COPY ./app/ ./

RUN npx prisma generate --schema ./src/prisma/schema.prisma

RUN npm run build

ENV NODE_ENV=production

EXPOSE 8081

CMD [ "node", "dist/index.js" ]