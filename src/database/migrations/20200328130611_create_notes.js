exports.up = function (knex) {
  return knex.schema.createTable("notes", function (table) {
    table.string("id").primary();
    table.string("title").notNullable();
    table.string("description").notNullable();
    table.string("user_id").notNullable();
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("notes");
};
