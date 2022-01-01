const express = require('express');
const cors = require('cors');
const res = require('express/lib/response');
require('dotenv').config();

let app = express();
const port = process.env.PORT

app.use(cors());

app.listen(port, () => {
    res.send(`Listening to port ${port}...`);
})

