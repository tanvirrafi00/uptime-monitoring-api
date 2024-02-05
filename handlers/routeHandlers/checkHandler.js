const data = require("../../lib/data");
const { hash, createRandomString } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("../../handlers/routeHandlers/tokenHandler");
const { maxChecks } = require("../../helpers/environments");
const handler = {};
handler.checkHandler = (reqProperties, callBack) => {
  const acceptedMethods = ["get", "put", "post", "delete"];

  if (acceptedMethods.indexOf(reqProperties.method) > -1) {
    handler._check[reqProperties.method](reqProperties, callBack);
  } else {
    callBack(405);
  }
};

handler._check = {};
handler._check.post = (reqProperties, callBack) => {
  const protocol =
    typeof reqProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(reqProperties.body.protocol) > -1
      ? reqProperties.body.protocol
      : false;

  const url =
    typeof reqProperties.body.url === "string" &&
    reqProperties.body.url.trim().length > 0
      ? reqProperties.body.url
      : false;
  const method =
    typeof reqProperties.body.method === "string" &&
    ["GET", "PUT", "POST", "DELETE"].indexOf(reqProperties.body.method) > -1
      ? reqProperties.body.method
      : false;
  const successCodes =
    typeof reqProperties.body.successCodes === "object" &&
    reqProperties.body.successCodes instanceof Array
      ? reqProperties.body.successCodes
      : false;
  const timeoutSeconds =
    typeof reqProperties.body.timeoutSeconds === "number" &&
    reqProperties.body.timeoutSeconds % 1 === 0 &&
    reqProperties.body.timeoutSeconds >= 1 &&
    reqProperties.body.timeoutSeconds <= 5
      ? reqProperties.body.timeoutSeconds
      : false;

  if (protocol && url && successCodes && timeoutSeconds) {
    let token =
      typeof reqProperties.headerObject.token === "string"
        ? reqProperties.headerObject.token
        : false;

    if (token) {
      data.read("token", token, (err, tokenData) => {
        if (!err && tokenData) {
          let userPhone = parseJSON(tokenData).phone;
          data.read("user", userPhone, (err, userData) => {
            if (!err && userData) {
              tokenHandler._tokens.verify(
                token,
                parseJSON(userData).phone,
                (validToken) => {
                  if (validToken) {
                    const userObject = parseJSON(userData);
                    const userChecks =
                      typeof userObject.checks === "object" &&
                      userObject.checks instanceof Array
                        ? userObject.checks
                        : [];
                    if (userChecks.length < maxChecks) {
                      let checkId = createRandomString(20);
                      let checkObject = {
                        id: checkId,
                        userPhone,
                        protocol,
                        url,
                        method,
                        successCodes,
                        timeoutSeconds,
                      };
                      //save the object
                      data.create("checks", checkId, checkObject, (err) => {
                        if (!err) {
                          //add checkId to the userObejcts
                          userObject.checks = userChecks;
                          userObject.checks.push(checkId);
                          //save the new user data
                          data.update("user", userPhone, userObject, (err) => {
                            if (!err) {
                              callBack(200, {
                                checkObject,
                              });
                            } else {
                              callBack(500, {
                                error: "There was a problem in server side!",
                              });
                            }
                          });
                        } else {
                          callBack(500, {
                            error: "There was a problem in server side!",
                          });
                        }
                      });
                    } else {
                      callBack(401, {
                        error: "User has already reached max check limit",
                      });
                    }
                  } else {
                    callBack(403, {
                      errr: "Authentication failure",
                    });
                  }
                }
              );
            } else {
              callBack(403, {
                errr: "Authentication failure",
              });
            }
          });
        } else {
          callBack(403, {
            errr: "Authentication failure",
          });
        }
      });
    } else {
      callBack(400, {
        error: "Raffi There was a problem in your request",
      });
    }
  } else {
    callBack(400, {
      error: "tanvir There was a problem in your request",
    });
  }
};
handler._check.put = (reqProperties, callBack) => {
  const id =
    typeof reqProperties.body.id === "string" &&
    reqProperties.body.id.trim().length === 20
      ? reqProperties.body.id
      : false;

  const protocol =
    typeof reqProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(reqProperties.body.protocol) > -1
      ? reqProperties.body.protocol
      : false;

  const url =
    typeof reqProperties.body.url === "string" &&
    reqProperties.body.url.trim().length > 0
      ? reqProperties.body.url
      : false;
  const method =
    typeof reqProperties.body.method === "string" &&
    ["GET", "PUT", "POST", "DELETE"].indexOf(reqProperties.body.method) > -1
      ? reqProperties.body.method
      : false;
  const successCodes =
    typeof reqProperties.body.successCodes === "object" &&
    reqProperties.body.successCodes instanceof Array
      ? reqProperties.body.successCodes
      : false;
  const timeoutSeconds =
    typeof reqProperties.body.timeoutSeconds === "number" &&
    reqProperties.body.timeoutSeconds % 1 === 0 &&
    reqProperties.body.timeoutSeconds >= 1 &&
    reqProperties.body.timeoutSeconds <= 5
      ? reqProperties.body.timeoutSeconds
      : false;
  if (id) {
    if (protocol && url && successCodes && timeoutSeconds) {
      data.read("checks", id, (err, checkData) => {
        if (!err) {
          checkDataObject = parseJSON(checkData);
          let token =
            typeof reqProperties.headerObject.token === "string"
              ? reqProperties.headerObject.token
              : false;
          tokenHandler._tokens.verify(
            token,
            checkDataObject.userPhone,
            (validToken) => {
              if (validToken) {
                if (protocol) checkDataObject.protocol = protocol;
                if (url) checkDataObject.url = url;
                if (method) checkDataObject.method = method;
                if (successCodes) checkDataObject.successCodes = successCodes;
                if (timeoutSeconds)
                  checkDataObject.timeoutSeconds = timeoutSeconds;
                data.update("checks", id, checkDataObject, (err) => {
                  if (!err) {
                    callBack(200, {
                      message: "Check updated succesfully",
                    });
                  } else {
                    callBack(500, {
                      error: "There was a server side error!",
                    });
                  }
                });
              } else {
                callBack(403, {
                  error: "Authentication error!",
                });
              }
            }
          );
        } else {
          callBack(500, {
            error: "There was a problem in the server side!",
          });
        }
      });
    } else {
      callBack(400, {
        error: "You must provide at least one field to update!",
      });
    }
  } else {
    callBack(400, {
      error: "Invalid Check Id!",
    });
  }
};
handler._check.get = (reqProperties, callBack) => {
  const id =
    typeof reqProperties.queryStringObject.id === "string" &&
    reqProperties.queryStringObject.id.trim().length === 20
      ? reqProperties.queryStringObject.id
      : false;
  if (id) {
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        let token =
          typeof reqProperties.headerObject.token === "string"
            ? reqProperties.headerObject.token
            : false;

        tokenHandler._tokens.verify(
          token,
          parseJSON(checkData).userPhone,
          (validToken) => {
            if (validToken) {
              callBack(200, parseJSON(checkData));
            } else {
              callBack(403, {
                errr: "Authentication failure",
              });
            }
          }
        );
      } else {
        callBack(404, {
          error: "rafi Check Not Found",
        });
      }
    });
  } else {
    callBack(404, {
      error: "Check Not Found",
    });
  }
};
handler._check.delete = (reqProperties, callBack) => {
  const id =
    typeof reqProperties.queryStringObject.id === "string" &&
    reqProperties.queryStringObject.id.trim().length === 20
      ? reqProperties.queryStringObject.id
      : false;
  if (id) {
    data.read("checks", id, (err, checkData) => {
      if (!err) {
        let token =
          typeof reqProperties.headerObject.token === "string"
            ? reqProperties.headerObject.token
            : false;

        tokenHandler._tokens.verify(
          token,
          parseJSON(checkData).userPhone,
          (validToken) => {
            if (validToken) {
              data.delete("checks", id, (err) => {
                if (!err) {
                  data.read(
                    "user",
                    parseJSON(checkData).userPhone,
                    (err, userData) => {
                      // console.log(userData);
                      if (!err && userData) {
                        let userDataObject = parseJSON(userData);
                        let userChecks =
                          typeof userDataObject.checks === "object" &&
                          userDataObject.checks instanceof Array
                            ? userDataObject.checks
                            : [];
                        const checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          userDataObject.checks = userChecks;
                          data.update(
                            "user",
                            userDataObject.phone,
                            userDataObject,
                            (err) => {
                              if (!err) {
                                callBack(200, {
                                  message: "Check deleted succesfully",
                                });
                              } else {
                                callBack(404, {
                                  error:
                                    "asif There was a problem in server side",
                                });
                              }
                            }
                          );
                        } else {
                          callBack(404, {
                            error: "hello There was a problem in server side",
                          });
                        }
                      } else {
                        callBack(404, {
                          error: "tanvir There was a problem in server side",
                        });
                      }
                    }
                  );
                } else {
                  callBack(404, {
                    error: "naima There was a problem in server side",
                  });
                }
              });
            } else {
              callBack(403, {
                errr: "Authentication failure",
              });
            }
          }
        );
      } else {
        callBack(404, {
          error: "rafi Check Not Found",
        });
      }
    });
  } else {
    callBack(404, {
      error: "Check Not Found",
    });
  }
};

module.exports = handler;
