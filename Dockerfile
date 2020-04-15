# Stage 1 - prepare sources
FROM node:13-alpine as build-deps
ADD . /app
WORKDIR /app
RUN npm pack
RUN tar -xzvf ./simple-screens-tester-*.tgz

FROM node:13-alpine
MAINTAINER zoobestik <kb.chernenko@gmail.com>

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

COPY --from=build-deps /app/package /app
WORKDIR /app

RUN npm install --production

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

ENV APP_EXECUTABLE_PATH="/usr/bin/chromium-browser"

# Run everything after as non-privileged user.
USER pptruser

CMD [ "node", "./index.mjs" ]
