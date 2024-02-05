const environments = {};

environments.staging = {
  port: 3000,
  envName: "staging",
  secretKey: "kjayrwqhhkaiuweqih",
  maxChecks: 5,
  twilio: {
    fromPhone: "+13418991203",
    accountSid: "ACc3c9a12d83f966f5f7ed7ba2f743747a",
    authToken: "33d3810157134dd6229ee99786b8dc77",
  },
};
environments.production = {
  port: 5000,
  envName: "production",
  secretKey: "uioewqjlnfklejasylkh",
  maxChecks: 5,
  twilio: {
    fromPhone: "+15557122661",
    accountSid: "ACc3c9a12d83f966f5f7ed7ba2f743747a",
    authToken: "33d3810157134dd6229ee99786b8dc77",
  },
};

const currentEnvironment = typeof (process.env.NODE_ENV === "string")
  ? process.env.NODE_ENV
  : "staging";
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentToExport;
