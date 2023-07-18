const url = require("url");
const http = require("http");
const path = require("path");
const fs = require("fs");
const LimitSizeStream = require("./LimitSizeStream");

const server = new http.Server();

server.on("request", (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, "files", pathname);

  switch (req.method) {
    case "POST":
      if (fs.existsSync(`${__dirname}/files/${pathname}`)) {
        res.statusCode = 409;
        res.end("the file already exists");
        break;
      }
      if (pathname.includes("/")) {
        res.statusCode = 400;
        res.end("bad request");
        break;
      }
      if (!fs.existsSync(`${__dirname}/files`)) {
        fs.mkdirSync(`${__dirname}/files`);
      }
      const stream = fs.createWriteStream(`${__dirname}/files/${pathname}`);
      const limitedStream = new LimitSizeStream({
        limit: 1048576,
        encoding: "utf-8",
      });

      req.pipe(limitedStream).pipe(stream);

      stream.on("finish", () => {
        res.statusCode = 201;
        res.end("success");
      });
      limitedStream.on("error", (error) => {
        if (error.code === "LIMIT_EXCEEDED") {
          res.statusCode = 413;
          res.end("file should be less than 1MB");
          fs.unlinkSync(`${__dirname}/files/${pathname}`);
        }
      });

      stream.on("error", (error) => {
        if (error.code === "ENOENT") {
          res.statusCode = 404;
          res.end(error.message);
        } else {
          res.statusCode = 500;
          res.end("something went wrong");
        }
      });
      req.on("aborted", () => {
        stream.destroy();
        fs.unlinkSync(`${__dirname}/files/${pathname}`);
      });
      break;

    default:
      res.statusCode = 501;
      res.end("Not implemented");
  }
});

module.exports = server;
