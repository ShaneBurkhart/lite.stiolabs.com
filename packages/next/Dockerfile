FROM node:19

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

COPY . .

# Build app
RUN npm run build

RUN npx prisma generate

EXPOSE 3000

CMD npm run start