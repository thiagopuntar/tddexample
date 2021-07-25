/* eslint-disable no-console */
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const router = require('./routes');

const swaggerDocument = YAML.load('./swagger.yml');
const app = express();
app.use(express.json());
app.use(router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
