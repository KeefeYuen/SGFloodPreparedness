const {
  validatePhoneNumber,
  checkQuizAnswer,
} = require("./components/validation");

describe("Emergency contact phone number validation", () => {
  test("rejects an empty phone number", () => {
    expect(validatePhoneNumber("")).toBe("Phone number is required");
  });

  test("rejects letters", () => {
    expect(validatePhoneNumber("abcdefgh")).toBe(
      "Phone number must contain numbers only",
    );
  });

  test("rejects a phone number with less than 8 digits", () => {
    expect(validatePhoneNumber("1234")).toBe("Phone number must be 8 digits");
  });

  test("rejects a phone number with more than 8 digits", () => {
    expect(validatePhoneNumber("123456789")).toBe(
      "Phone number must be 8 digits",
    );
  });

  test("accepts a valid 8 digit phone number", () => {
    expect(validatePhoneNumber("91234567")).toBe("Valid");
  });
});

describe("Quiz answer validation", () => {
  test("returns true for a correct answer", () => {
    expect(checkQuizAnswer("A", "A")).toBe(true);
  });

  test("returns false for an incorrect answer", () => {
    expect(checkQuizAnswer("B", "A")).toBe(false);
  });

  test("correctly checks answer B", () => {
    expect(checkQuizAnswer("B", "B")).toBe(true);
  });

  test("does not accept A when correct answer is B", () => {
    expect(checkQuizAnswer("A", "B")).toBe(false);
  });
});
