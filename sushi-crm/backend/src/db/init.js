const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../sushi.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);

// WAL mode - tezroq ishlaydi
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema ni o'qib jadvallarni yaratish
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

console.log('✅ Database tayyor:', DB_PATH);

module.exports = db;