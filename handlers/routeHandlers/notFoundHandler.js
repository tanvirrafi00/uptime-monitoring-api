const handler = {};
handler.notFoundHandler = (reqProperties, callback) => {
  callback(404, {
    message: "Url not found",
  });
};
module.exports = handler;
