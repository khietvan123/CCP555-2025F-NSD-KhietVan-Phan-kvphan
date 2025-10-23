# This is a Dockerfile for lab 5.

# Use node version 20.15.1
FROM node:20.15.1

# ------------------------------------------------------------
# Metadata: who maintains this image and what it's for
# ------------------------------------------------------------
LABEL maintainer="Khiet Van Phan <kvphan@myseneca.ca>"
LABEL description="Fragments Node.js microservice for CCP555 lab5"

# We default to use port 8080 in our service
ENV PORT=8080
 
# Reduce npm spam when installing within Docker
# [URL documentation]
ENV NPM_CONFIG_LOGLEVEL=warn
 
# Disable colour when run inside Docker
# [URL documentation]
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# ------------------------------------------------------------
# Copy dependency files (choose one style, here Option 2)
# ------------------------------------------------------------
# Option 1: COPY package*.json /app/
# Option 2: COPY package*.json ./       <- commonly used after WORKDIR
# Option 3: COPY package.json package-lock.json ./
COPY package*.json ./

# ------------------------------------------------------------
# Install dependencies
# ------------------------------------------------------------
# Installs node modules defined in package-lock.json
RUN npm install

# ------------------------------------------------------------
# Copy source code
# ------------------------------------------------------------
# Copies our application source files into the image
# so that /app/src exists and contains our server code
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# ------------------------------------------------------------
# Expose container port
# ------------------------------------------------------------
# Documentation: the service listens on port 8080
EXPOSE 8080

# ------------------------------------------------------------
# Command to start the microservice
# ------------------------------------------------------------
# Defines the default command for running our container
CMD npm start