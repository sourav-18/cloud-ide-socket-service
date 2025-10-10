FROM node:22.0.0


WORKDIR /code
COPY package-lock.json /code/package-lock
COPY package.json /code/package.json

RUN npm install

COPY . /code

RUN npm run build
CMD ["npm", "run", "start"]
