function notFound(req, res) {
  res.status(404).json({ message: `Route không tồn tại: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  // MySQL duplicate entry
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Dữ liệu đã tồn tại (duplicate entry)." });
  }

  const status = err.status || 500;
  const message = status < 500 ? err.message : "Lỗi server nội bộ.";
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
