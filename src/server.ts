import { config } from "@dotenvx/dotenvx";
import app from "../netlify/functions/externalapi";
import { Server } from "http";

config();

// Run the server
export const server = app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Server is running on http://localhost:${process.env.SERVER_PORT}`
  );
});

export default app;
