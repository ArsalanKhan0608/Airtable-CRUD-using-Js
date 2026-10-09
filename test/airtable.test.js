const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');
const { createClient } = require('../airtableClient');

test('configuration is validated before constructing a client', () => {
  class FakeSDK { constructor() { assert.fail('must not construct'); } }
  assert.throws(() => createClient({}, FakeSDK), /AIRTABLE_API_KEY.*AIRTABLE_BASE_ID.*AIRTABLE_TABLE_NAME/);
});

test('client uses the requested base/table and returns SDK results', async () => {
  const calls = [];
  const table = {
    create: async (fields) => ({ id: 'rec1', fields }),
    select: () => ({ all: async () => [{ id: 'rec1' }] }),
    update: async (id, fields) => ({ id, fields }),
    destroy: async (id) => ({ id, deleted: true }),
  };
  class FakeSDK {
    constructor(options) { calls.push(options); }
    base(id) { calls.push(id); return (name) => { calls.push(name); return table; }; }
  }
  const client = createClient({ AIRTABLE_API_KEY: 'test', AIRTABLE_BASE_ID: 'app1', AIRTABLE_TABLE_NAME: 'Demo' }, FakeSDK);
  assert.deepEqual(calls, [{ apiKey: 'test' }, 'app1', 'Demo']);
  assert.equal((await client.insertRecord({ Name: 'Test' })).id, 'rec1');
  assert.equal((await client.readRecords()).length, 1);
  assert.equal((await client.updateRecord('rec1', { Name: 'Updated' })).fields.Name, 'Updated');
  assert.equal((await client.deleteRecord('rec1')).deleted, true);
});

test('CRUD waits for each request and uses the new record ID', async () => {
  const calls = [];
  await require('../airtableUpdated').main({
    insertRecord: async () => { calls.push('create'); return { id: 'new-record' }; },
    readRecords: async () => { calls.push('read'); return []; },
    updateRecord: async (id) => { calls.push(`update:${id}`); },
    deleteRecord: async (id) => { calls.push(`delete:${id}`); },
  });
  assert.deepEqual(calls, ['create', 'read', 'update:new-record', 'delete:new-record']);
});

test('failed update propagates and does not run the delete', async () => {
  const error = new Error('update failed');
  await assert.rejects(require('../airtableUpdated').main({
    insertRecord: async () => ({ id: 'new-record' }),
    readRecords: async () => [],
    updateRecord: async () => { throw error; },
    deleteRecord: async () => assert.fail('must not delete after failure'),
  }), error);
});

for (const script of ['airtable.js', 'airtableUpdated.js']) {
  test(`${script} imports without configuration or requests`, () => {
    const result = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(path.join(__dirname, '..', script))})`], { env: {}, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
  });
  test(`${script} exits unsuccessfully with a configuration error`, () => {
    const result = spawnSync(process.execPath, [path.join(__dirname, '..', script)], { env: {}, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing configuration:/);
    assert.doesNotMatch(result.stderr, /ReferenceError/);
  });
}
