FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Dockerfile (backend/)
RUN apt-get update && apt-get install -y netcat-openbsd

CMD ["sh", "-c", "until nc -z mysql 3306; do echo '⏳ Waiting for MySQL...'; sleep 2; done && node src/index.js"]

# CMD ["node", "src/index.js"]
