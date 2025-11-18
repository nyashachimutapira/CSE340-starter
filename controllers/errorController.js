const errorController = {};

/**
 * Intentionally throw a server error to validate middleware flow.
 */
errorController.triggerServerError = async function triggerServerError() {
  const error = new Error(
    "This is a planned server error to confirm the error-handling flow."
  );
  error.status = 500;
  throw error;
};

module.exports = errorController;

