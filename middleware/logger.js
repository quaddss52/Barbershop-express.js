import color from "colors";
export default function logger(req, res, next) {
  const method = req.method;
  const methodcolorMap = {
    GET: "green",
    POST: "blue",
    PUT: "yellow",
    DELETE: "red",
  };
  const color = methodcolorMap[method] || "white";
  const url = req.originalUrl;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${url}`[color]);
  next();
}
