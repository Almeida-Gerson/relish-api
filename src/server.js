const express = require("express");
const cors = require("cors");
const photoRoutes = require("./routes/photoRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/externalapi", photoRoutes);

// Error Handling middleware
app.use(errorHandler);

// Run the server
app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
