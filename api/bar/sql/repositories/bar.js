const { createTable, deleteRecord, getRecord, putRecord } = require('../queries');
const cs = {};

const createColumnsets = (pgp) => {
    if (!cs.insert) {
        const table = new pgp.helpers.TableName({ table: 'bar', schema: 'public' });
        cs.insert = new pgp.helpers.ColumnSet(['name'], { table });
        cs.update = cs.insert.extend(['?id']);
    }

    return cs;
}

class BarRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;

        createColumnsets(pgp);
    }

    createTable() {
        return this.db.none(createTable).then(() => {
            console.log('Table "bar" created.');
        }).catch(error => {
            console.log('ERROR:', error.message || error);
        });
    }
    deleteRecord(id) {
        return this.db.result(deleteRecord, {
            id: +id
        });
    }
    getRecord(id) {
        return this.db.oneOrNone(getRecord, {
            id: +id
        });
    }
    putRecord(body) {
        const { name } = body;
        return this.db.one(putRecord, name)
    }
}

module.exports = BarRepository;