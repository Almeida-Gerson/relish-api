import { config } from "@dotenvx/dotenvx";
import app from "../netlify/functions/externalapi";

config();

// Run the server
app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Server is running on http://localhost:${process.env.SERVER_PORT}`
  );
});

export default app;
