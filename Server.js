const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Client.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file || req.file.mimetype !== 'application/pdf') {
    res.status(400).json({ error: 'Invalid file. Please upload a PDF file.' });
    return;
  }

  const destinationPath = path.join(__dirname, 'uploads', req.file.originalname);
  fs.renameSync(req.file.path, destinationPath);

  res.json({ message: 'File uploaded successfully.', filename: req.file.originalname });
});

app.get('/files/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found.' });
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  res.setHeader('Content-Type', 'application/pdf');
  fileStream.pipe(res);
});

app.delete('/files/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found.' });
    return;
  }

  fs.unlinkSync(filePath);

  res.json({ message: 'File deleted successfully.' });
});

app.get('/files', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ files });
  });
});

app.listen(3000, () => {
  console.log('Server started on port http://localhost:3000');
});
