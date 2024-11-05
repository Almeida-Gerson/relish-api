const errorHandler = (err, req, res, next) => {
  console.log("🚀 ~ errorHandler ~ err:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.stack });
};

module.exports = errorHandler;
