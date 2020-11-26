FROM node:12.16.1
ENV PORT 4000
WORKDIR /app

COPY ./package.json ./package-lock.json /app/
RUN npm i

COPY ./src /app/src

EXPOSE ${PORT}
CMD [ "npm", "start" ]