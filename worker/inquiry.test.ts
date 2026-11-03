import { describe, expect, it } from "vitest";
import { contact } from "../src/data/site";
import { notification, validate } from "./inquiry";

const good = { name: "Ana Cruz", email: "ana@example.com", service: "Website", message: "We need a site for our bakery." };

describe("validate", () => {
  it("accepts a complete message and trims it", () => {
    expect(validate({ ...good, name: "  Ana Cruz  " })).toEqual({ inquiry: good });
  });

  it("accepts every project type the form offers", () => {
    for (const service of contact.projectTypes) {
      expect(validate({ ...good, service })).toEqual({ inquiry: { ...good, service } });
    }
  });

  it("names every missing field", () => {
    const result = validate({});
    expect("errors" in result && Object.keys(result.errors).sort()).toEqual(["email", "message", "name", "service"]);
  });

  it("refuses a malformed email, an unknown project type, and a short message", () => {
    const result = validate({ ...good, email: "ana@", service: "Crypto", message: "hi" });
    expect("errors" in result && Object.keys(result.errors).sort()).toEqual(["email", "message", "service"]);
  });

  it("refuses line breaks in fields that become email headers", () => {
    const result = validate({ ...good, name: "Ana\r\nBcc: someone@example.com" });
    expect("errors" in result && result.errors.name).toBeTruthy();
  });

  it("ignores values that are not text", () => {
    const result = validate({ ...good, message: ["We need a site for our bakery."] });
    expect("errors" in result && result.errors.message).toBeTruthy();
  });

  it("caps the message length", () => {
    expect("errors" in validate({ ...good, message: "x".repeat(5001) })).toBe(true);
  });
});

describe("notification", () => {
  it("carries every field and the time received, in Manila and UTC", () => {
    const mail = notification(good, new Date("2026-11-03T07:45:00Z"));
    expect(mail.subject).toBe("[Karakoa] Website: Ana Cruz");
    for (const part of ["Ana Cruz", "ana@example.com", "Website", "We need a site for our bakery.", "3:45 PM Manila time", "2026-11-03T07:45:00.000Z"]) {
      expect(mail.text).toContain(part);
    }
  });
});
