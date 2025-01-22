FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --omit=dev --no-update-notifier
COPY src ./src
EXPOSE 3000
CMD ["npm", "run", "start"]
