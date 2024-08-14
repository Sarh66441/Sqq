const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'speech_to_text'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Serve static files
app.use(express.static('public'));

// Handle socket connection
io.on('connection', socket => {
    console.log('A user connected');

    socket.on('voice', data => {
        // Save the audio file
        const audioFilePath = `./audio/${Date.now()}.wav`;
        require('fs').writeFileSync(audioFilePath, data);

        // Convert speech to text using Python
        exec(`python3 convert.py ${audioFilePath}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`exec error: ${err}`);
                return;
            }

            const text = stdout.trim();

            // Save text to database
            db.query('INSERT INTO transcriptions SET ?', { text }, (err, res) => {
                if (err) throw err;
                console.log('Text saved to database');
            });

            // Send the text back to the client
            socket.emit('text', text);
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
