module.exports = async (fastify) => {
  fastify.get("/users", async (req, reply) => {
    return require("../responses/users.list.json");
  });
};
