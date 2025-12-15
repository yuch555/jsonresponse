module.exports = async (fastify) => {
  fastify.get("/users/:id", async (req, reply) => {
    const { id } = req.params;

    if (id === "999") {
      return reply.code(404).send({
        error: "User not found",
        message: `User with ID ${id} does not exist`
      });
    }

    const response = require("../responses/users.detail.json");
    return {
      ...response,
      id: parseInt(id)
    };
  });
};
