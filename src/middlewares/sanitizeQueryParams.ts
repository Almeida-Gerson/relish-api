import { Request, Response, NextFunction } from "express";
import { query, validationResult } from "express-validator";
import xss from "xss";

const buildGenericValidation = (key: string) =>
  query(key)
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .customSanitizer((value) => xss(value))
    .isAlphanumeric("en-US", { ignore: " " })
    .withMessage("Only alphanumeric characters are allowed");

// Middleware to sanitize and validate query parameters
const sanitizeQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Validation chains
  const validation = [
    buildGenericValidation("title"),
    buildGenericValidation("album.title"),
    buildGenericValidation("album.user.email"),

    query("limit")
      .optional({ checkFalsy: true })
      .isInt({ min: 0, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    query("offset")
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage("Limit must be between 1 and 100"),
  ];

  // Run validation chains
  const result = validation.map((validator) => validator.run(req));

  // Wait for all validation promises to resolve
  Promise.all(result)
    .then(() => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    })
    .catch((error) => {
      console.error("Validation failed", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });
};

export default sanitizeQueryParams;
