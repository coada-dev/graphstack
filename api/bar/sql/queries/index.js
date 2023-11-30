const { join } = require('path');
const { QueryFile } = require('pg-promise');

const sql = (file) => {
    const path = join(__dirname, file);
    const options = { minify: true };
    const qf = new QueryFile(path, options);

    if (qf.error) {
        console.error(qf.error);
    }

    return qf;
}

module.exports = {
    createTable: sql('createTable.sql'),
    deleteRecord: sql('deleteRecord.sql'),
    getRecord: sql('getRecord.sql'),
    putRecord: sql('putRecord.sql')
}