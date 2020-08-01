const dbConnection = require("../database/connection");

module.exports = {
  async index(req, res) {
    const user_id = req.headers.authorization;
    const user = await dbConnection("users")
      .select("name")
      .where({ id: user_id })
      .first();

    if (user) {
      const data = await dbConnection("notes")
        .select("id", "title", "description", "created_at", "updated_at")
        .where({ user_id })
        .orderBy("id");

      for (let i = 0; i < data.length; i++) {
        const toDos = await dbConnection("toDos")
          .select("id", "label", "checked")
          .where({ note_id: data[i].id });

        data[i].toDos = toDos;
      }

      return res.json(data);
    } else {
      return res.status(401).json({ Error: "Invalid id" });
    }
  },

  async syncDatabase(req, res) {
    const user_id = req.headers.authorization;
    const user = await dbConnection("users")
      .select("name")
      .where({ id: user_id })
      .first();

    if (user) {
      const requestNotes = req.body.notes;
      const databaseNotes = await dbConnection("notes")
        .select("id", "title", "description", "created_at", "updated_at")
        .where({ user_id });

      var newNotes = [];
      var isNew = true;
      requestNotes.forEach((requestNote) => {
        isNew = true;
        databaseNotes.forEach((databaseNote) => {
          if (requestNote.id === databaseNote.id) {
            isNew = false;
            const databaseDate = databaseNote.updated_at.substr(9).split("/");
            const databaseTime = databaseNote.updated_at
              .substr(0, 8)
              .split(":");
            const databaseTimestamp = new Date(
              "20" + databaseDate[2],
              databaseDate[1] - 1,
              databaseDate[0],
              databaseTime[0],
              databaseTime[1],
              databaseTime[2]
            );

            const requestDate = requestNote.updated_at.substr(9).split("/");
            const requestTime = requestNote.updated_at.substr(0, 8).split(":");
            const requestTimestamp = new Date(
              "20" + requestDate[2],
              requestDate[1] - 1,
              requestDate[0],
              requestTime[0],
              requestTime[1],
              requestTime[2]
            );
            if (new Date(databaseTimestamp) < new Date(requestTimestamp))
              newNotes.push(requestNote);
          }
        });
        if (isNew) {
          newNotes.push(requestNote);
          isNew = true;
        }
      });
      var { deleted } = req.body;
      deleted.forEach(async (id) => {
        await dbConnection("notes").delete().where({ id });
      });

      newNotes.forEach(async (note) => {
        await dbConnection("notes").delete().where({ id: note.id });

        await dbConnection("notes").insert({
          id: note.id,
          title: note.title,
          description: note.description,
          user_id,
          created_at: note.created_at,
          updated_at: note.updated_at,
        });

        note.toDos.forEach(async (toDo) => {
          await dbConnection("toDos").insert({
            id: toDo.id,
            label: toDo.label,
            checked: toDo.checked,
            note_id: note.id,
          });
        });
      });

      return res.status(204).send();
    } else {
      return res.status(401).json({ Error: "Invalid id" });
    }
  },

  async syncDatabaseMobile(req, res) {
    const user_id = req.headers.authorization;
    const user = await dbConnection("users")
      .select("name")
      .where({ id: user_id })
      .first();

    if (user) {
      const requestNotes = req.body.notes;
      const databaseNotes = await dbConnection("notes")
        .select("id", "title", "description", "created_at", "updated_at")
        .where({ user_id });

      var newNotes = [];
      requestNotes.forEach((requestNote) => {
        databaseNotes.forEach((databaseNote) => {
          if (requestNote.id === databaseNote.id) {
            const databaseDate = databaseNote.updated_at.substr(9).split("/");
            const databaseTime = databaseNote.updated_at
              .substr(0, 8)
              .split(":");
            const databaseTimestamp = new Date(
              "20" + databaseDate[2],
              databaseDate[1] - 1,
              databaseDate[0],
              databaseTime[0],
              databaseTime[1],
              databaseTime[2]
            );

            const requestDate = requestNote.updated_at.substr(9).split("/");
            const requestTime = requestNote.updated_at.substr(0, 8).split(":");
            const requestTimestamp = new Date(
              "20" + requestDate[2],
              requestDate[1] - 1,
              requestDate[0],
              requestTime[0],
              requestTime[1],
              requestTime[2]
            );
            if (new Date(databaseTimestamp) < new Date(requestTimestamp))
              newNotes.push(requestNote);
          }
        });
      });

      req.body.newNotes.forEach((id) => {
        requestNotes.forEach((note) => {
          if (id == note.id) {
            newNotes.push(note);
          }
        });
      });

      var { deleted } = req.body;
      deleted.forEach(async (id) => {
        await dbConnection("notes").delete().where({ id });
      });

      newNotes.forEach(async (note) => {
        await dbConnection("notes").delete().where({ id: note.id });

        await dbConnection("notes").insert({
          id: note.id,
          title: note.title,
          description: note.description,
          user_id,
          created_at: note.created_at,
          updated_at: note.updated_at,
        });

        note.toDos.forEach(async (toDo) => {
          await dbConnection("toDos").insert({
            id: toDo.id,
            label: toDo.label,
            checked: toDo.checked,
            note_id: note.id,
          });
        });
      });

      var responseNotes = [...newNotes, ...databaseNotes];
      var unique = responseNotes
        .map((e) => e["id"])
        .map((e, i, final) => final.indexOf(e) === i && i)
        .filter((e) => responseNotes[e])
        .map((e) => responseNotes[e]);
      deleted.forEach(async (id) => {
        unique = unique.filter((note) => note.id != id);
      });

      for (let i = 0; i < unique.length; i++) {
        if (!unique[i].toDo) {
          const toDos = await dbConnection("toDos")
            .select("id", "label", "checked")
            .where({ note_id: unique[i].id });

          unique[i].toDos = toDos;
        }
      }

      return res.json(unique);
    } else {
      return res.status(401).json({ Error: "Invalid id" });
    }
  },
};
