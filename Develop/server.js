const fs = require('fs');
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');           
const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      const notes = JSON.parse(data);
      res.json(notes);
    });
  });
  

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/api/notes', (req, res) => {
    let newNote = req.body;
    newNote.id = uuidv4();
    let noteList = JSON.parse(fs.readFileSync('./db/db.json', 'utf-8'));
  
    noteList.push(newNote);
  
    fs.writeFileSync('./db/db.json', JSON.stringify(noteList));
    res.json(newNote);
  });
  
  app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    const dbFilePath = path.join(__dirname, 'db/db.json');
  
    try {
      let noteList = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
      const noteIndex = noteList.findIndex((note) => note.id === noteId);
  
      if (noteIndex !== -1) {
        noteList.splice(noteIndex, 1);
        fs.writeFileSync(dbFilePath, JSON.stringify(noteList));
        res.json({ msg: 'Note deleted successfully' });
      } else {
        res.status(404).json({ error: 'Note not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(PORT, () => console.log('Server listening on port' + PORT));