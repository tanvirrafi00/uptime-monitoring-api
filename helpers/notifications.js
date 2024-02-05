// dependencies
const https = require("https");
const querystring = require("querystring");
const twilio = require("twilio");
const environments = require("./environments");
const accountSid = environments.twilio.accountSid;
const authToken = environments.twilio.authToken;
const client = twilio(accountSid, authToken);
// module scaffolding
const notifications = {};

// send sms to user using twilio api
notifications.sendTwilioSms = async (phone, msg, callback) => {
  // input validation
  const userPhone = typeof phone === "string" ? phone.trim() : false;

  const userMsg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && userMsg) {
    await client.messages
      .create({
        from: environments.twilio.fromPhone,
        body: userMsg,
        to: `+88${userPhone}`,
      })
      .then((message) => {
        callback(false);
      })
      .catch((error) => {
        callback(error);
      });
  } else {
    callback("Given parameters were missing or invalid!");
  }
};

// export the module
module.exports = notifications;
