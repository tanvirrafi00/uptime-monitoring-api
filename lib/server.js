//dependencies
const http = require("http");
const url = require("url");
const data = require("./data");
const environment = require("../helpers/environments");
const { StringDecoder } = require("string_decoder");
const { handleRequest } = require("../helpers/handleResReq");

const server = {};

server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);
  createServerVariable.listen(environment.port, () => {
    console.log(`server is listening on ${environment.port}`);
  });
};

server.handleReqRes = handleRequest;

server.init = () => {
  server.createServer();
};
module.exports = server;
