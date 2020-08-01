const { Router } = require("express");

const NoteController = require("./controllers/NoteController");
const UserController = require("./controllers/UserController");

const routes = Router();

routes.post("/users", UserController.loginOrCreate);
routes.delete("/users/:id", UserController.delete);

routes.post("/sync", NoteController.syncDatabase);
routes.post("/syncMob", NoteController.syncDatabaseMobile);
routes.get("/notes", NoteController.index);

module.exports = routes;
