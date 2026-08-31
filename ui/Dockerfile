
# Multi-stage build for React App

# Stage 1: Build the React application

FROM nonprod.com/multiarchitecture-golden-base-images/ubi8-nodejs-minimal:nodejs-20 as react-build

 

USER root

COPY  / /codebase

WORKDIR /codebase

RUN npm install

RUN npm run build

 

## Stage 2: Serve the application with Nginx

FROM nonprod.com/multiarchitecture-golden-base-images/nginx-image-with-certs:latest

 

USER root

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=react-build /codebase/dist /usr/share/nginx/html/clarity

EXPOSE 80

RUN setcap cap_net_bind_service=+ep /usr/sbin/nginx

# USER 1001

CMD ["nginx", "-g", "daemon off;"]

 

 