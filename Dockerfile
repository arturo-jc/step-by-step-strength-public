# Use an official Node.js runtime to build the Angular app
FROM node:18 as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Use Nginx to serve the built Angular app
FROM nginx:alpine

COPY --from=build /usr/src/app/dist/frontend /usr/share/nginx/html

COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

# Expose the default Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
