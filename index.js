const http = require("http");
const https = require("https");
const fs = require("fs");
const config = require("./config");
const { URL } = require("url");
const querystring = require("querystring");
const StringDecoder = require("string_decoder").StringDecoder;

/* #region HTTPS server config & launch */

const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem")
};

const server_S = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

server_S.listen(config.https, () => {
  console.log(`HTTPS listening on ${config.https}`);
});

/* #endregion HTTPS server config & launch */

/* #region HTTP server launch */

const server = http.createServer((req, res) => {
  unifiedServer(req, res);
});

server.listen(config.http, () => {
  console.log(`HTTP listening on ${config.http}`);
});

/* #endregion HTTP server launch */

//routers here. TODO refactor resoonses to other files.
const routers = {
  hello: (data, res) => {
    if (data.method !== "POST") {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(418);
      res.end(
        `{"message":"you're supposed to POST here (or at least brew coffee)"}`
      );
      console.log("requester was trying to be funny");
    } else {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(`{"message": "Hello World"}`);
      console.log("Message delivered");
    }
  },
  notFound: (data, res) => {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(404);
    res.end(`
      <html>
        <head>
          <title>You're asking for too much</title>
        </head>
        <body>
          <p>
            author was too lazy to create this page. there might be something
            here in the future, but don't count on it.
          </p>
          <img
            src="https://media.giphy.com/media/YVm9sOmwsdLe8/giphy.gif"
            alt="really funny cat"
          />
        </body>
      </html>
    `);
  }
};

/* #region server logic, prelude */
const unifiedServer = (req, res) => {
  // docs say url.parse() is depreciated, used URL constructor instead.
  // constructor needs a host, http://foo.bar chosen for giggles
  const myUrl = new URL(req.url, "http://foo.bar");

  //recieve payload part one to (n-1)
  const decoder = new StringDecoder("utf-8");

  let payload = "";
  req.on("data", data => {
    payload += decoder.write(data);
  });

  /* #endregion server logic, prelude */

  /* #region server logic, pass request to who cares most */

  //finalize reception of payload (if any)
  req.on("end", () => {
    payload += decoder.end();

    //and build data object
    //URL.search will keep initial "?", so substring is used
    const data = {
      method: req.method,
      headers: req.headers,
      pathname: myUrl.pathname.replace(/^\/+|\/+$/g, ""),
      searchParams: querystring.parse(myUrl.search.substr(1)),
      payload: payload
    };

    //route request or default to not found, invoke immediately with collected data
    (routers[data.pathname] || routers.notFound)(data, res);
  });
  /* #endregion server logic, pass request to who cares most*/
};
