exports.up = async function (knex) {
  await knex.schema.createTable('app_user', (t) => {
    t.increments('id')
      .unsigned()
      .primary();

    t.string('name', 50).notNullable();
    t.string('email')
      .notNullable()
      .unique();

    t.string('password').notNullable();
    t.string('role', 20).notNullable();
    t.boolean('is_active')
      .notNullable()
      .defaultTo(true);

    t.dateTime('created_at').notNullable();
    t.dateTime('updated_at').notNullable();

    t.string('last_ip_address', 50).notNullable();
  });

  await knex.schema.createTable('trip', (t) => {
    t.increments('id')
      .unsigned()
      .primary();

    t.string('destination', 100).notNullable();
    t.dateTime('start_date').notNullable();
    t.dateTime('end_date').notNullable();
    t.text('comment').nullable();

    t.integer('user_id')
      .unsigned()
      .notNullable();

    t.foreign('user_id')
      .references('id')
      .inTable('app_user');

    t.dateTime('created_at').notNullable();
    t.dateTime('updated_at').notNullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('trip');
  await knex.schema.dropTable('app_user');
};
