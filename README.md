# Relish API

Relish API services.

## Requirements

-   node 22.2.0 use of below tool is suggested
    -   [nvm](https://github.com/creationix/nvm)
-   npm 10.x


## Usage

1. Clone this repo
2. Install `relish-api`'s 3rd party dependencies from `package-lock.json` via
    ```
    npm ci
    ```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the api in the development mode.\
Open [http://localhost:3000/externalapi/photos](http://localhost:3000/externalapi/photos) to test it.(this port can be changed using environment variables)


### `npm test`

Launches the test runner

### `npm run build`

Builds the netlify app for production to the `.netlify` folder.\

## Demo
- https://relish-api.netlify.app/externalapi/photos
- https://relish-api.netlify.app/externalapi/photos/1

## Environment Variables

Within each file(`.env.development`, `.env.production`, `.env.testing`) will include environment variables.

Of note:

-   `SERVER_PORT` will be used as the port used to run the app

### Tools Used

- axios
- cors
- express
- node-cache
- serverless-http
- jest
- netlify-cli
- supertest
- dotenvx

### Deployment

Netlify will build and deploy when changes are pushed to this repo
