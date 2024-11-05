const request = require("supertest");
const { mock_photo, mock_photos } = require("./mock_store");

const requestInstance = request("http://localhost:3000");

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
