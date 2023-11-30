const pgPromise = require('pg-promise');
const BarRepository = require('./repositories/bar');

const initOptions = {
    extend(obj, dc) {
        obj.bar = new BarRepository(obj, pgp);
    }
}

const pgp = pgPromise(initOptions);
const database = process.env.AWS_RDS_DATABASE;
const host = process.env.AWS_RDS_HOSTNAME;
const password = process.env.AWS_RDS_PASSWORD;
const port = process.env.AWS_RDS_PORT || 5432;
const username = process.env.AWS_RDS_USERNAME || "username";
const db = pgp(`postgres://${username}:${password}@${host}:${port}/${database}`);

module.exports = { db, pgp };