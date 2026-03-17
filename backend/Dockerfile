FROM node:22-alpine

WORKDIR /app

COPY ./app/ ./

RUN ls
RUN npm install 
RUN ls -R /app



COPY ./app ./
RUN npx prisma generate --schema ./src/prisma/schema.prisma

RUN npm run build

EXPOSE 8081

CMD [ "node", "dist/index.js" ]

# package.json -> tem que estar configurado para tdo o que usar dentro deste backend

