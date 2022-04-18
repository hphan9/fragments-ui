# This is a dockerfile for building Docker image of Fragments-ui application

## Stage 0: Install apline linux + node +dependencies 
FROM node:16.11.1-alpine3.14@sha256:de6a0e968273c5290f790bd8ef4ae300eaab372bbeec17e4849481328f1f2c17 AS dependencies

LABEL maintainer="Emily Phan<hphan9@myseneca.ca>" \
      description="Fragments-ui Parcel web application"

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn

#disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

#Copy the package*.json file to current repo which is /app
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --only=production

############################################################

# Build stage
FROM node:16.11.1-alpine3.14@sha256:de6a0e968273c5290f790bd8ef4ae300eaab372bbeec17e4849481328f1f2c17 AS build

WORKDIR /app

COPY --from=dependencies . .

#Copy src to /app/src/
COPY ./src/. ./src
COPY ./.env ./

RUN npm run build

# Start with nginx on Debian
FROM nginx:stable As production

# Use /usr/local/src/fragments-ui as our working directory
WORKDIR /usr/local/src/fragments-ui

# Copy the dist folder in the static folder 
COPY --from=build ./app/dist/ /usr/share/nginx/html/

# nginx will be running on port 80
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
   CMD curl --fail localhost:80 || exit 1
