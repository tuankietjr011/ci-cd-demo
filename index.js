const express = require('express');
const path = require('path');
const backendApp = require('./backend/server');

const app = express();
const port = process.env.PORT || 3000;

// 1. Phục vụ thư mục frontend tĩnh
app.use(express.static(path.join(__dirname, 'frontend')));

// 2. Định tuyến API sang module backend
app.use(backendApp);

// 3. Fallback trả về index.html của frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(port, () => {
  console.log(`Application running at port ${port}`);
});
