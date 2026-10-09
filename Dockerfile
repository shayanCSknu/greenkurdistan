FROM node:24-bookworm-slim
WORKDIR /app
COPY --chown=node:node . .
RUN mkdir -p /app/data /app/.cache && chown -R node:node /app/data /app/.cache
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 COOKIE_SECURE=1 DATA_FILE=/app/data/reports.sqlite
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]
