import { describe, expect, it } from "vitest";
import { contact } from "../src/data/site";
import { notification, validate } from "./inquiry";

const good = { name: "Ana Cruz", email: "ana@example.com", service: "Website", timeline: "In 1 to 3 months", message: "We need a site for our bakery." };

describe("validate", () => {
  it("accepts a complete message and trims it", () => {
    expect(validate({ ...good, name: "  Ana Cruz  " })).toEqual({ inquiry: good });
  });

  it("accepts every project type the form offers", () => {
    for (const service of contact.projectTypes) {
      expect(validate({ ...good, service })).toEqual({ inquiry: { ...good, service } });
    }
  });

  it("accepts every start time the form offers", () => {
    for (const timeline of contact.timelines) {
      expect(validate({ ...good, timeline })).toEqual({ inquiry: { ...good, timeline } });
    }
  });

  it("names every missing field", () => {
    const result = validate({});
    expect("errors" in result && Object.keys(result.errors).sort()).toEqual(["email", "name", "service", "timeline"]);
  });

  it("refuses a malformed email, an unknown project type, and an unknown start time", () => {
    const result = validate({ ...good, email: "ana@", service: "Crypto", timeline: "Yesterday" });
    expect("errors" in result && Object.keys(result.errors).sort()).toEqual(["email", "service", "timeline"]);
  });

  it("accepts an empty or missing message", () => {
    const { message, ...noMessage } = good;
    for (const input of [{ ...good, message: "" }, noMessage]) {
      const result = validate(input);
      expect("inquiry" in result && result.inquiry.message).toBe("");
    }
  });

  it("refuses line breaks in fields that become email headers", () => {
    const result = validate({ ...good, name: "Ana\r\nBcc: someone@example.com" });
    expect("errors" in result && result.errors.name).toBeTruthy();
  });

  it("ignores values that are not text", () => {
    const result = validate({ ...good, name: ["Ana"] });
    expect("errors" in result && result.errors.name).toBeTruthy();
  });

  it("caps the message length", () => {
    expect("errors" in validate({ ...good, message: "x".repeat(5001) })).toBe(true);
  });
});

describe("notification", () => {
  it("carries every field and the time received, in Manila and UTC", () => {
    const mail = notification(good, new Date("2026-11-03T07:45:00Z"));
    expect(mail.subject).toBe("[Karakoa] Website, In 1 to 3 months: Ana Cruz");
    for (const part of ["Ana Cruz", "ana@example.com", "Website", "Start: In 1 to 3 months", "We need a site for our bakery.", "3:45 PM Manila time", "2026-11-03T07:45:00.000Z"]) {
      expect(mail.text).toContain(part);
    }
  });

  it("says when there are no notes", () => {
    expect(notification({ ...good, message: "" }, new Date()).text).toContain("Notes: none");
  });
});
