const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON, createRandomString } = require("../../helpers/utilities");

const handler = {};
handler.tokenHandler = (reqProperties, callBack) => {
  const acceptedMethods = ["get", "put", "post", "delete"];

  if (acceptedMethods.indexOf(reqProperties.method) > -1) {
    handler._tokens[reqProperties.method](reqProperties, callBack);
  } else {
    callBack(405);
  }
};

handler._tokens = {};
handler._tokens.post = (reqProperties, callBack) => {
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

  if (phone && password) {
    data.read("user", phone, (err, userData) => {
      const hashedPassword = hash(password);
      const userDataObject = parseJSON(userData);
      if (!err && hashedPassword === userDataObject.password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone,
          id: tokenId,
          expires,
        };
        data.create("token", tokenId, tokenObject, (err) => {
          if (!err) {
            callBack(200, {
              tokenObject,
            });
          } else {
            callBack(500, {
              error: "There was a problem in server side!",
            });
          }
        });

        //data.create("token",)
      } else {
        callBack(400, {
          error: "Rafiii There was a problem in request",
        });
      }
    });
  } else {
    callBack(400, {
      error: "There was a problem in request",
    });
  }
};
handler._tokens.get = (reqProperties, callBack) => {
  const id =
    typeof reqProperties.queryStringObject.id === "string" &&
    reqProperties.queryStringObject.id.trim().length === 20
      ? reqProperties.queryStringObject.id
      : false;
  if (id) {
    data.read("token", id, (err, data) => {
      tokenData = parseJSON(data);
      if (!err && tokenData) {
        callBack(200, tokenData);
      } else {
        callBack(404, {
          error: "Token Not Found",
        });
      }
    });
  } else {
    callBack(404, {
      error: "Token Not Found",
    });
  }
};
handler._tokens.put = (reqProperties, callBack) => {
  const id =
    typeof reqProperties.body.id === "string" &&
    reqProperties.body.id.trim().length === 20
      ? reqProperties.body.id
      : false;

  const extend =
    typeof reqProperties.body.extend === "boolean"
      ? reqProperties.body.extend
      : false;

  if (id && extend) {
    data.read("token", id, (err, tokenData) => {
      if (!err) {
        const tokenDataObject = parseJSON(tokenData);
        if (tokenDataObject.expires > Date.now()) {
          tokenDataObject.expires = Date.now() + 60 * 60 * 1000;

          data.update("token", id, tokenDataObject, (err) => {
            if (!err) {
              callBack(200, {
                message: "Updated Succesfully",
              });
            } else {
              callBack(500, {
                error: "Failed to update there was a problem in server side!",
              });
            }
          });
        } else {
          callBack(400, {
            error: "Token already expired!",
          });
        }
      } else {
        callBack(404, {
          error: "Token Not Found",
        });
      }
    });
  } else {
    callBack(400, {
      error: "There was a problem in your request!",
    });
  }
};

handler._tokens.delete = (reqProperties, callBack) => {
  const id =
    typeof reqProperties.queryStringObject.id === "string" &&
    reqProperties.queryStringObject.id.trim().length === 20
      ? reqProperties.queryStringObject.id
      : false;
  if (id) {
    data.read("token", id, (err, tokenData) => {
      if (!err) {
        data.delete("token", id, (err) => {
          if (!err && tokenData) {
            callBack(200, {
              message: "Token deleted Succesfully",
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
    callBack(400, {
      error: "There was a problem in your request",
    });
  }
};

handler._tokens.verify = (id, phone, callBack) => {
  if (id) {
    data.read("token", id, (err, tokenData) => {
      if (!err && tokenData) {
        if (
          parseJSON(tokenData).phone === phone &&
          parseJSON(tokenData).expires > Date.now()
        ) {
          callBack(true);
        } else {
          callBack(false);
        }
      } else {
        callBack(false);
      }
    });
  } else {
    callBack(false);
  }
};

module.exports = handler;
