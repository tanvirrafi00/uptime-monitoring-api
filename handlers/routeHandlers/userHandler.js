const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("../../handlers/routeHandlers/tokenHandler");

const handler = {};
handler.userHandler = (reqProperties, callBack) => {
  const acceptedMethods = ["get", "put", "post", "delete"];

  if (acceptedMethods.indexOf(reqProperties.method) > -1) {
    handler._users[reqProperties.method](reqProperties, callBack);
  } else {
    callBack(405);
  }
};

handler._users = {};
handler._users.post = (reqProperties, callBack) => {
  const firstName =
    typeof reqProperties.body.firstName === "string" &&
    reqProperties.body.firstName.trim().length > 0
      ? reqProperties.body.firstName
      : false;

  const lastName =
    typeof reqProperties.body.lastName === "string" &&
    reqProperties.body.lastName.trim().length > 0
      ? reqProperties.body.lastName
      : false;

  const phone =
    typeof reqProperties.body.phone === "string" &&
    reqProperties.body.phone.trim().length === 11
      ? reqProperties.body.phone
      : false;

  const password =
    typeof reqProperties.body.password === "string" &&
    reqProperties.body.password.trim().length > 0
      ? reqProperties.body.password
      : false;

  const tosAgreement =
    reqProperties.body.tosAgreement === "true" ||
    reqProperties.body.tosAgreement == "false"
      ? reqProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password) {
    data.read("user", phone, (err, user) => {
      if (!err) {
        //file exist
        callBack(500, {
          error: "There was a problem in server side!",
        });
      } else {
        //file not exist
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        data.create("user", phone, userObject, (err) => {
          if (err) {
            callBack(500, {
              error: "could not create a user",
            });
          } else {
            callBack(200, {
              message: "user was created succesfully",
            });
          }
        });
      }
    });
  } else {
    callBack(400, {
      error: "Error in request",
    });
  }
};
handler._users.put = (reqProperties, callBack) => {
  const firstName =
    typeof reqProperties.body.firstName === "string" &&
    reqProperties.body.firstName.trim().length > 0
      ? reqProperties.body.firstName
      : false;

  const lastName =
    typeof reqProperties.body.lastName === "string" &&
    reqProperties.body.lastName.trim().length > 0
      ? reqProperties.body.lastName
      : false;

  const phone =
    typeof reqProperties.body.phone === "string" &&
    reqProperties.body.phone.trim().length === 11
      ? reqProperties.body.phone
      : false;

  const password =
    typeof reqProperties.body.password === "string" &&
    reqProperties.body.password.trim().length > 0
      ? reqProperties.body.password
      : false;

  if (phone) {
    let token =
      typeof reqProperties.headerObject.token === "string"
        ? reqProperties.headerObject.token
        : false;
    tokenHandler._tokens.verify(token, phone, (tokenId) => {
      if (tokenId) {
        if (lastName || firstName || password) {
          data.read("user", phone, (err, uData) => {
            const userData = { ...parseJSON(uData) };
            if (!err && userData) {
              if (firstName) userData.firstName = firstName;
              if (lastName) userData.lastName = lastName;
              if (password) userData.password = hash(password);

              data.update("user", phone, userData, (err) => {
                if (!err) {
                  callBack(200, {
                    message: "Updated Succesfully",
                  });
                } else {
                  callBack(500, {
                    error:
                      "Failed to update there was a problem in server side!",
                  });
                }
              });
            } else {
              callBack(500, {
                error: "user not found There was a problem in server side!",
              });
            }
          });
        } else {
          callBack(500, {
            error: " There was a problem in server side!",
          });
        }
      } else {
        callBack(403, {
          errr: "Authentication failure",
        });
      }
    });
  } else {
    callBack(400, {
      error: "Invalid phone Number!",
    });
  }
};
handler._users.get = (reqProperties, callBack) => {
  const phone =
    typeof reqProperties.queryStringObject.phone === "string" &&
    reqProperties.queryStringObject.phone.trim().length === 11
      ? reqProperties.queryStringObject.phone
      : false;

  if (phone) {
    let token =
      typeof reqProperties.headerObject.token === "string"
        ? reqProperties.headerObject.token
        : false;
    tokenHandler._tokens.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.read("user", phone, (err, u) => {
          const user = { ...parseJSON(u) };

          if (!err && user) {
            delete user.password;
            callBack(200, user);
          } else {
            callBack(404, {
              error: "User Not Found",
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
    callBack(404, {
      error: "User Not Found",
    });
  }
};
handler._users.delete = (reqProperties, callBack) => {
  const phone =
    typeof reqProperties.queryStringObject.phone === "string" &&
    reqProperties.queryStringObject.phone.trim().length === 11
      ? reqProperties.queryStringObject.phone
      : false;

  if (phone) {
    let token =
      typeof reqProperties.headerObject.token === "string"
        ? reqProperties.headerObject.token
        : false;
    tokenHandler._tokens.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.read("user", phone, (err, userData) => {
          if (!err && userData) {
            data.delete("user", phone, (err) => {
              if (!err) {
                callBack(200, {
                  message: "User succesfully deleted",
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
        callBack(403, {
          errr: "Authentication failure",
        });
      }
    });
  } else {
    callBack(400, {
      error: "There was a problem in your request",
    });
  }
};

module.exports = handler;
