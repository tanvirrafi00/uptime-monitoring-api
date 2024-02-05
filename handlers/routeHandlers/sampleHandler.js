const handler = {};
handler.sampleHandler = (reqProperties, callBack) => {
  callBack(200, {
    message: "This is sample url",
  });
};
module.exports = handler;
