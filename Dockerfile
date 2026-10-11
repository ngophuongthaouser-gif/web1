# Dockerfile cho Backend Node.js
FROM node:20-alpine

WORKDIR /app

# Sao chép package.json và cài đặt thư viện
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev

# Sao chép toàn bộ mã nguồn (cả frontend tĩnh và backend)
WORKDIR /app
COPY . .

WORKDIR /app/backend

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
