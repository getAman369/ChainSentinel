FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/

RUN npx tsc --noEmit || true
RUN npx tsc

FROM python:3.11-alpine AS ml-base

WORKDIR /app/ml

COPY ml/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PYTHONPATH=/app/ml
ENV CONFIDENCE_THRESHOLD=0.5

RUN apk add --no-cache python3

COPY --from=builder /app/dist/ ./dist/
COPY --from=ml-base /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/

COPY package*.json ./
RUN npm ci --only=production

COPY public/ ./public/
COPY ml/ ./ml/
COPY docs/ ./docs/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
