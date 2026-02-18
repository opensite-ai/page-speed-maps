import {
  generateGoogleDirectionsLink,
  generateGoogleMapLink
} from "../src/utils/googleMapLinks";

describe("google map link utilities", () => {
  it("creates a map link with default zoom", () => {
    expect(generateGoogleMapLink(40.7, -74.0)).toBe(
      "https://www.google.com/maps/@40.7,-74,15z"
    );
  });

  it("creates a directions link", () => {
    expect(generateGoogleDirectionsLink(40.7, -74.0)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=40.7,-74"
    );
  });
});
