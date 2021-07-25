/* eslint-disable no-console */
const express = require('express');
const router = require('./routes');

const app = express();
app.use(express.json());
app.use(router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
