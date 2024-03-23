FROM oven/bun:1.0.35-alpine
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build
CMD ["bun", "build/index.js"]
EXPOSE 3000