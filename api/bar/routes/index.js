const express = require('express');
const router = express.Router();

const { db } = require('../sql');
db.bar.createTable();

const handler = (method, uri, handler) => {
  router[method](uri, async (req, res) => {
    try {
      const data = await handler(req);
      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.json({
        success: false,
        error: error.message || error.toString()
      })
    }
  });
};

handler('delete', '/bar/:id', req => db.bar.deleteRecord(req.params.id));
handler('get', '/bar/:id', req => db.bar.getRecord(req.params.id));
handler('put', '/bar/create', req => db.bar.putRecord(req.body));

module.exports = router;
