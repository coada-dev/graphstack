const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/', (req, res) => {
    res.json(req.body);
});

app.listen(port, () => {
    console.log(`🚀 Express started on port ${port}`);
});