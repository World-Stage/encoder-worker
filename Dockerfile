# FROM: prebuilt ffmpeg image
FROM jrottenberg/ffmpeg:6.1-ubuntu

# Install Node.js
RUN apt-get update && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean

# Set working directory
WORKDIR /usr/src/app

# Copy app source
COPY package*.json ./
RUN npm install
COPY . .

# Override the FFmpeg entrypoint!
ENTRYPOINT [ "node" ]
CMD [ "index.js" ]
