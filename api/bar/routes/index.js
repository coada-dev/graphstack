const express = require('express');
const router = express.Router();

const { db } = require('../sql');
db.bar.createTable();

const handler = (method, uri, handler) => {
  router[method](uri, async (req, res) => {
    const data = handler(req)
      .then((data) => {
        res.json({
          ...data
        });
      }).catch(error => {
        res.json({
          error:  error.message || error
        });
      });
  });
};

handler('delete', '/bar/:id', req => db.bar.deleteRecord(req.params.id));
handler('get', '/bar/:id', req => db.bar.getRecord(req.params.id));
handler('put', '/bar/create', req => db.bar.putRecord(req.body));

module.exports = router;
