require("@dotenvx/dotenvx").config();
const app = require("../netlify/functions/externalapi");

// Run the server
app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Server is running on http://localhost:${process.env.SERVER_PORT}`
  );
});

module.exports = app;
