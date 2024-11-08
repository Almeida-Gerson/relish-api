import { config } from "@dotenvx/dotenvx";
import request from "supertest";
import { server } from "../src/server";
import { mock_photo, mock_photos } from "./mock_store";

config();

const requestInstance = request(server);

describe("GET /externalapi/photos", () => {
  it("should return a list of photos", async () => {
    const response = await requestInstance.get(
      "/externalapi/photos?title=accusamus+beatae+ad+facilis+cum+similique+qui+sunt"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mock_photos);
  });
});

describe("GET /externalapi/photos/:id", () => {
  it("should return a photo", async () => {
    const response = await requestInstance.get("/externalapi/photos/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mock_photo);
  });

  it("should return null", async () => {
    const response = await requestInstance.get("/externalapi/photos/a");

    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });
});

// Close the server after all tests are completed
afterAll((done) => {
  server.close(done); // Ensures server is properly closed
});
