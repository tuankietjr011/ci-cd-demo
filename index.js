const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Phiên bản V2: CI/CD tự động cập nhật thành công!</h1>');
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
