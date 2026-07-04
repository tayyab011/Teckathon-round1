const { createApp } = require("./src/app");
const config = require("./src/config");

const { server } = createApp();

server.listen(config.port, "0.0.0.0", () => {
  console.log(`[Server] Running: http://localhost:${config.port}`);
  console.log(`[Server] Dashboard: http://localhost:${config.port}`);
  console.log(`[Server] API: http://localhost:${config.port}/api`);
});
