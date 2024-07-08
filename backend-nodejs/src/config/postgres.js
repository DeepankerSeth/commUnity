const pgp = require('pg-promise')();
const dotenv = require('dotenv');
dotenv.config();

const db = pgp(process.env.POSTGRES_URI);

db.connect()
  .then(obj => {
    obj.done();
    console.log('Connected to PostgreSQL');
  })
  .catch(error => {
    console.error('PostgreSQL connection error:', error);
  });

module.exports = db;