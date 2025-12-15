const fastify = require("fastify")({ logger: true });

fastify.register(require("@fastify/autoload"), {
  dir: __dirname + "/routes"
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("🚀 Mock API server running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
