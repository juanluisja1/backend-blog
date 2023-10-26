// database.js
const sqlite3 = require('sqlite3').verbose();

// Create and connect to the SQLite database
const db = new sqlite3.Database('./blog.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the blog database...');
});

let sql = `CREATE TABLE IF NOT EXISTS`;

// Create the tables for users, posts, and comments
db.serialize(() => {
  db.run(`${sql} users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL
  )`);

  db.run(`${sql} posts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    author_id INTEGER,
    FOREIGN KEY (author_id) REFERENCES users(id)
  )`);

  db.run(`${sql} comments (
    id INTEGER PRIMARY KEY,
    comment TEXT NOT NULL,
    post_id INTEGER,
    author_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
  )`);
});

module.exports = db;

