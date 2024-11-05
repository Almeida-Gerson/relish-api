const app = require("../netlify/functions/api");

// Run the server
app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
