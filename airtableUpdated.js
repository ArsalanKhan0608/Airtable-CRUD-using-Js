const { createClient } = require('./airtableClient');

async function main(client = createClient()) {
  const record = await client.insertRecord({ Name: 'John Doe' });
  console.log('Record inserted:', record.id);
  const records = await client.readRecords();
  console.log('Records read:', records.length);
  await client.updateRecord(record.id, { Name: 'John Doe Updated' });
  console.log('Record updated:', record.id);
  await client.deleteRecord(record.id);
  console.log('Record deleted:', record.id);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Airtable example failed:', error.message);
    process.exitCode = 1;
  });
}
module.exports = { main };
