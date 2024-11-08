import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import photoRoutes from "../../src/routes/photoRoutes";
import errorHandler from "../../src/middlewares/errorHandler";
import sanitizeQueryParams from "../../src/middlewares/sanitizeQueryParams";

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Sanitize query parameters  middleware
app.use(sanitizeQueryParams);

// Routes
app.use("/externalapi", photoRoutes);

// Error Handling middleware
app.use(errorHandler);

export const handler = serverless(app);

export default app;
