const fs = require("fs");
const path = require("path");
const lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");

lib.create = (dir, file, data, callback) => {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        const stringData = JSON.stringify(data);
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                callback(false);
              } else {
                callback("Error closing the new file");
              }
            });
          } else {
            callback("error writing to new file");
          }
        });
      } else {
        callback(err);
      }
    }
  );
};

lib.read = (dir, file, callback) => {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf-8",
    (err, data) => {
      callback(err, data);
    }
  );
};

lib.update = (dir, file, data, callback) => {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    (err, fileDescriptor) => {
      if (!err) {
        const stringData = JSON.stringify(data);
        fs.ftruncate(fileDescriptor, (err) => {
          if (!err) {
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    callback(false);
                  } else {
                    console.log("error closing file");
                  }
                });
              } else {
                console.log("error writing file");
              }
            });
          } else {
            console.log("error truncating");
          }
        });
      } else {
        callback("error opening file");
      }
    }
  );
};

lib.delete = (dir, file, callBack) => {
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", (err) => {
    if (!err) {
      callBack(false);
    } else {
      callBack("Error deleting file");
    }
  });
};

lib.list = (dir, callBack) => {
  fs.readdir(`${lib.baseDir + dir}/`, (err, fileNmaes) => {
    if (!err && fileNmaes && fileNmaes.length > 0) {
      const trimmedFileNames = [];
      fileNmaes.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace(".json", ""));
      });
      callBack(false, trimmedFileNames);
    } else {
      callBack(400, { error: "Error reading directory!" });
    }
  });
};
module.exports = lib;
