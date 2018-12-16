const enviroments = {
  default: {
    http: 4000,
    https: 4001
  },
  test: {
    http: 5000,
    https: 5001
  }
};

//process NODE_ENV, if any.

const env = process.env.NODE_ENV || "";

//export enviroment if set. else, use default.

const current = enviroments[env.toLowerCase()] || enviroments.default;

module.exports = current;
