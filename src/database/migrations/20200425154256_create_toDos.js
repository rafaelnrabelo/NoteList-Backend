exports.up = function (knex) {
  return knex.schema.createTable("toDos", function (table) {
    table.string("id").primary();
    table.string("label").notNullable();
    table.boolean("checked").notNullable();
    table.string("note_id").notNullable();
    table
      .foreign("note_id")
      .references("id")
      .inTable("notes")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("toDos");
};
