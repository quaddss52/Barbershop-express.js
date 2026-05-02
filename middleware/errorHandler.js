export default function errorHandler(err, req, res, next) {
  if (err.status) {
    res
      .status(err.status)
      .json({ message: err.message || "An error occurred" });
    return;
  }
  return res.status(500).json({ message: err.message || "An error occurred" });
}
