# Airtable JavaScript examples

Two Node.js examples use the Airtable SDK: `airtable.js` creates a record and reads the table; `airtableUpdated.js` creates, reads, updates, and deletes its new record in order.

## Setup

Use Node.js 18 or newer and run `npm install`. Create a **test table** with a text field named `Name`. Set these environment variables in your shell:

```sh
export AIRTABLE_API_KEY='your-personal-access-token'
export AIRTABLE_BASE_ID='app...'
export AIRTABLE_TABLE_NAME='Your test table'
node airtable.js
# Or run the complete CRUD example:
node airtableUpdated.js
```

The token needs access to the selected base and record read/write scopes. Keep it out of source control. The simple example leaves its created record in the table. The complete example deletes only the record it created after a successful update. If a later request fails, the record may remain; use the printed ID to inspect it.

Importing either example does not connect to Airtable. Missing configuration or a failed request produces a nonzero CLI exit code. Adapt the example fields to your own table schema.

## Verification

`npm test` runs offline regression tests with a fake SDK/client. It does not exercise a live base or require credentials.

`airtable.php` is a separate legacy PHP example outside the verified JavaScript workflow. Its Composer dependency and rendering have not been validated by these tests.
