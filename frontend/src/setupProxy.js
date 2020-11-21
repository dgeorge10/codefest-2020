const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://prieur.ml:2020",
      changeOrigin: true,
    })
  );
};
