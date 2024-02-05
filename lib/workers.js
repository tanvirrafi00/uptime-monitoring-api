const url = require("url");
const http = require("http");
const https = require("https");
const data = require("./data");
const { parseJSON } = require("../helpers/utilities");
const { sendTwilioSms } = require("../helpers/notifications");
workers = {};

workers.gatherAllChecks = () => {
  data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        data.read("checks", check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            workers.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log("Error: reading one of the checks data!");
          }
        });
      });
    } else {
      console.log("Error: could not find any checks to process!");
    }
  });
};
workers.validateCheckData = (originalCheckData) => {
  const originalData = originalCheckData;
  if (originalCheckData && originalCheckData.id) {
    originalData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";

    originalData.lastChecked =
      typeof originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

   
    workers.performCheck(originalData);
  } else {
    console.log("Error: check was invalid or not properly formatted!");
  }
};
workers.performCheck = (originalCheckData) => {
 
  let checkOutCome = {
    error: false,
    responseCode: false,
  };
 
  let outcomeSent = false;


  const parsedUrl = url.parse(
    `${originalCheckData.protocol}://${originalCheckData.url}`,
    true
  );
  const hostName = parsedUrl.hostname;
  const { path } = parsedUrl;

 
  const requestDetails = {
    protocol: `${originalCheckData.protocol}:`,
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  const protocolToUse = originalCheckData.protocol === "http" ? http : https;

  const req = protocolToUse.request(requestDetails, (res) => {
   
    const status = res.statusCode;
    
    checkOutCome.responseCode = status;
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutCome);
      outcomeSent = true;
    }
  });

  req.on("error", (e) => {
    checkOutCome = {
      error: true,
      value: e,
    };
   
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutCome);
      outcomeSent = true;
    }
  });

  req.on("timeout", () => {
    checkOutCome = {
      error: true,
      value: "timeout",
    };
 
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutCome);
      outcomeSent = true;
    }
  });


  req.end();
};
workers.processCheckOutcome = (originalCheckData, checkOutCome) => {

  const state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1
      ? "up"
      : "down";

 
  const alertWanted = !!(
    originalCheckData.lastChecked && originalCheckData.state !== state
  );

  // update the check data
  const newCheckData = originalCheckData;

  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // update the check to disk
  data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        // send the checkdata to next process
        workers.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Alert is not needed as there is no state change!");
      }
    } else {
      console.log("Error trying to save check data of one of the checks!");
    }
  });
};

workers.alertUserToStatusChange = (newCheckData) => {
  const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is currently ${newCheckData.state}`;

  sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log(`User was alerted to a status change via SMS: ${msg}`);
    } else {
      console.log("There was a problem sending sms to one of the user!");
    }
  });
};

workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 8000);
};
workers.init = () => {
  workers.gatherAllChecks();

  workers.loop();
};
module.exports = workers;
