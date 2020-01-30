const express = require('express');
const index = require('./routes/index');

const app = express();
const { PORT = 3000 } = process.env;

app.use(express.static(`${__dirname}/public`));
app.use('/', index);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
