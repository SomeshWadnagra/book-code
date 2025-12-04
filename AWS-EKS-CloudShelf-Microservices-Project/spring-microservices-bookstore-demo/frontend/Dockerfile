# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Enable standalone Next.js output
ENV NEXT_TELEMETRY_DISABLED=1

# Build with placeholder values (must be valid URLs for Next.js validation)
ENV NEXT_PUBLIC_API_BASE_URL=http://PLACEHOLDER_API_BASE_URL
ENV NEXT_PUBLIC_API_GATEWAY_URL=http://PLACEHOLDER_API_GATEWAY_URL
ENV NEXT_PUBLIC_USE_DUMMY_DATA=false
ENV NEXT_PUBLIC_AWS_REGION=us-east-1
ENV NEXT_PUBLIC_COGNITO_USER_POOL_ID=PLACEHOLDER_USER_POOL_ID
ENV NEXT_PUBLIC_COGNITO_CLIENT_ID=PLACEHOLDER_CLIENT_ID
ENV MINIKUBE_API_HOST=http://PLACEHOLDER_API_HOST

RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone server
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create entrypoint script
COPY <<'EOF' /app/entrypoint.sh
#!/bin/sh
set -e

echo "Replacing environment variables at runtime..."

# Replace placeholders with actual runtime env vars
find /app/.next -type f \( -name "*.js" -o -name "*.json" \) | while read file; do
  sed -i "s|http://PLACEHOLDER_API_BASE_URL|${NEXT_PUBLIC_API_BASE_URL:-}|g" "$file"
  sed -i "s|http://PLACEHOLDER_API_GATEWAY_URL|${NEXT_PUBLIC_API_GATEWAY_URL:-}|g" "$file"
  sed -i "s|PLACEHOLDER_USER_POOL_ID|${NEXT_PUBLIC_COGNITO_USER_POOL_ID:-}|g" "$file"
  sed -i "s|PLACEHOLDER_CLIENT_ID|${NEXT_PUBLIC_COGNITO_CLIENT_ID:-}|g" "$file"
  sed -i "s|http://PLACEHOLDER_API_HOST|${MINIKUBE_API_HOST:-}|g" "$file"
done

echo "Starting server..."
exec node server.js
EOF

RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]