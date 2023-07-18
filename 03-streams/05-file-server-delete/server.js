const url = require("url");
const http = require("http");
const path = require("path");
const fs = require("fs");

const server = new http.Server();

server.on("request", (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, "files", pathname);

  switch (req.method) {
    case "DELETE":
      try {
        if (!fs.existsSync(`${__dirname}/files/${pathname}`)) {
          res.statusCode = 404;
          res.end("the file doesn't exists");
          break;
        }
        if (pathname.includes("/")) {
          res.statusCode = 400;
          res.end("bad request");
          break;
        }
        fs.unlink(`${__dirname}/files/${pathname}`, () => {
          res.statusCode = 201;
          res.end("success");
        });
      } catch (error) {
        res.statusCode = 500;
        res.end("something went wrong");
        console.log(error);
      }
      break;

    default:
      res.statusCode = 501;
      res.end("Not implemented");
  }
});

module.exports = server;
