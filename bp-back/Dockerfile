FROM node:20

WORKDIR /app

COPY dist/ ./dist
COPY package.json ./
COPY tsconfig.json ./
COPY prisma/ ./prisma

# Templates HTML
COPY src ./src

RUN npm install

EXPOSE 80

CMD ["npm", "run", "start:prod"]
