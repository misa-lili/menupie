FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -y
RUN npm run build
CMD ["node", "build"]
EXPOSE 3000