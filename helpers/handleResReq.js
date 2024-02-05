const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("../routes");
const {
  notFoundHandler,
} = require("../handlers/routeHandlers/notFoundHandler");

const { parseJSON } = require("../helpers/utilities");

const handler = {};
handler.handleRequest = (req, res) => {
  const parseUrl = url.parse(req.url, true);
  const path = parseUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  console.log(trimmedPath);
  const method = req.method.toLowerCase();
  const queryStringObject = parseUrl.query;
  const headerObject = req.headers;

  const reqProperties = {
    parseUrl,
    path,
    trimmedPath,
    method,
    queryStringObject,
    headerObject,
  };

  const decoder = new StringDecoder("utf-8");
  let realData = "";

  chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

  req.on("data", (buffer) => {
    realData += decoder.write(buffer);
  });
  req.on("end", () => {
    realData += decoder.end();
    
    reqProperties.body = parseJSON(realData);
    chosenHandler(reqProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      payload = typeof payload === "object" ? payload : {};
      payloadString = JSON.stringify(payload);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
    });
    
  });
};
module.exports = handler;
