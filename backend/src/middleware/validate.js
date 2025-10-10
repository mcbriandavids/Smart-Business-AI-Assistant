const Joi = require("joi");

/**
 * Validate request payloads with Joi schemas.
 * Provide any of body, query, params schemas; only provided parts are validated.
 * On validation error, responds with 400 and a concise details array.
 *
 * Pseudocode
 * ----------
 * validate({ body?, query?, params? }):
 *   for each part in [body, query, params]:
 *     if schema provided:
 *       validate req[part] with Joi (abortEarly=false, stripUnknown=true)
 *       if error -> 400 with details
 *       else replace req[part] with parsed value
 *   next()
 */
module.exports = function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      const parts = ["body", "query", "params"];
      for (const part of parts) {
        if (!schemas[part]) continue;
        const schema = schemas[part];
        const { error, value } = schema.validate(req[part], {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            details: error.details.map((d) => ({
              path: d.path.join("."),
              message: d.message.replace(/"/g, ""),
              type: d.type,
            })),
          });
        }
        req[part] = value;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
