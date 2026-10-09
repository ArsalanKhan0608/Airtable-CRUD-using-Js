// Importing examples makes no requests; configure a client only when needed.
function createClient(env = process.env, Airtable = require('airtable')) {
  const required = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME'];
  const missing = required.filter((name) => !env[name] || !env[name].trim());
  if (missing.length) {
    throw new Error(`Missing configuration: ${missing.join(', ')}`);
  }
  const table = new Airtable({ apiKey: env.AIRTABLE_API_KEY })
    .base(env.AIRTABLE_BASE_ID)(env.AIRTABLE_TABLE_NAME);
  return {
    insertRecord: (fields) => table.create(fields),
    readRecords: () => table.select().all(),
    updateRecord: (id, fields) => table.update(id, fields),
    deleteRecord: (id) => table.destroy(id),
  };
}
module.exports = { createClient };
