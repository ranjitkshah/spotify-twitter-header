const request = require("request");

exports.getRequest = (url) =>  {
    return new Promise(function (resolve, reject) {
        request.get(url, function (error, res, body) {
          if (!error && res.statusCode == 200) {
            resolve(body);
          } else {
            reject(error);
          }
        });
      });
};

exports.postRequest = (url) =>  {
    return new Promise(function (resolve, reject) {
        request.post(url, function (error, res, body) {
          if (!error && res.statusCode == 200) {
            resolve(body);
          } else {
            reject(error);
          }
        });
      });
};