function validatePhoneNumber(number) {
  if (!number || !number.trim()) {
    return "Phone number is required";
  }

  if (!/^[0-9]+$/.test(number.trim())) {
    return "Phone number must contain numbers only";
  }

  if (number.trim().length !== 8) {
    return "Phone number must be 8 digits";
  }

  return "Valid";
}

function checkQuizAnswer(selectedChoice, correctAnswer) {
  return selectedChoice === correctAnswer;
}

module.exports = {
  validatePhoneNumber,
  checkQuizAnswer,
};
