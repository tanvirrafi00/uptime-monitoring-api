const crypto = require("crypto");
const environment = require("../helpers/environments");

const utilities = {};

utilities.parseJSON = (jsonString) => {
  let output = {};
  try {
    output = JSON.parse(jsonString);
    return output;
  } catch (err) {
    output = {};
  }
};
utilities.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", environment.secretKey)

      // updating data
      .update(str)

      // Encoding to be used
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};
utilities.createRandomString = (len) => {
  const posibleString = "abcdefghijklmnopqwxyz0123456789";
  let output = "";
  for (let i = 0; i < len; i++) {
    let char = posibleString.charAt(
      Math.floor(Math.random() * posibleString.length)
    );
    output += char;
  }
  return output;
};
module.exports = utilities;
