module.exports = async (fastify) => {
  fastify.post("/auth/login", async (req, reply) => {
    const { email } = req.body || {};

    if (email === "error@test.com") {
      return reply.code(401).send(require("../responses/auth.login.error.json"));
    }

    return require("../responses/auth.login.success.json");
  });
};
