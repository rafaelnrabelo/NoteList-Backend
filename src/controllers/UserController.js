const dbConnection = require("../database/connection");

module.exports = {
  async loginOrCreate(req, res) {
    const { id, name, email } = req.body;

    const exists = await dbConnection("users")
      .select("name")
      .where({ id })
      .first();

    if (!exists) {
      await dbConnection("users").insert({
        id,
        name,
        email,
      });
    }

    return res.json({ created: !exists });
  },

  async delete(req, res) {
    const { id } = req.params;
    const user = await dbConnection("users")
      .select("name")
      .where({ id })
      .first();

    if (user) {
      await dbConnection("users").delete().where({ id });

      return res.status(204).send();
    } else {
      return res.status(401).json({ Error: "Invalid id" });
    }
  },
};
