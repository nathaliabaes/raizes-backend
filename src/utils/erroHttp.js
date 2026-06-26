function erroHttp(res, status, error, message, path, details = []) {
  return res.status(status).json({
    error,
    message,
    details,
    timestamp: new Date().toISOString(),
    path,
  });
}

module.exports = erroHttp;
