function logger(req, res, next) {
  console.log("1. Logger started");

  next();

  console.log("3. Logger finished");
}

module.exports = logger;