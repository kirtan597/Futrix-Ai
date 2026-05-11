FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
# PORT is injected by Railway at runtime — server.js reads process.env.PORT
EXPOSE 5000
CMD ["node", "server.js"]
