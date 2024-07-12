require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});