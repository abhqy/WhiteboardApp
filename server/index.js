const express = require('express');
const cors = require('cors');
const res = require('express/lib/response');
require('dotenv').config();

const io = require('socket.io')(8080, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

let app = express();
const port = process.env.PORT

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Placeholder.')
});

let connections = [];

io.on('connection', (socket) => {
    connections.push(socket)
    console.log('socket.io: User connected ', socket.id);

    socket.on('draw', (data) => {
        connections.forEach(connection => {
            if (connection.id !== socket.id) {
                connection.emit('ondraw', {
                    mouseCoordinates: data.mouseCoordinates,
                    newMouseCoordinates: data.newMouseCoordinates
                });
            }
        })
    })

    socket.on('disconnect', (err) => {
        connections = connections.filter((connection) => (connection.id !== socket.id));
    })
});

app.listen(port, () => {
    console.log(`Listening to port ${port}...`);
});

