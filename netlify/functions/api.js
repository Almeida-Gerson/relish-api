const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const photoRoutes = require("../../src/photo/photoRoutes");
const errorHandler = require("../../src/middlewares/errorHandler");

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/.netlify/functions/externalapi", photoRoutes);

// Error Handling middleware
app.use(errorHandler);

const handler = serverless(app);

module.exports = app;
module.exports.handler = handler;
