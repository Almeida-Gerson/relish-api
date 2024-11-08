import { NextFunction, Request, Response } from "express";

const errorHandler = (err: Error, _: Request, res: Response) => {
  console.log("🚀 ~ errorHandler ~ err:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.stack });
};

export default errorHandler;
