const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { players, addPlayer, removePlayer } = require('./playerData');
const { authenticate } = require('./auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static('client'));

// Sample users for demonstration
const users = [
    { id: 1, username: 'player1', password: '$2a$10$5.LhTiM9K8Pn8kV9Jtb9l.n/iEfbQnl2A8BoOgwuzODhgr2gyP2ji' }, // password is '1234'
    { id: 2, username: 'player2', password: '$2a$10$7sHsV5J3RbaV7s6O/fPZw.t3oJGbphmnqlgOToxUBhzPrqHvZvU.6' }  // password is 'password'
];

// Player Authentication Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(400).send('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send('Invalid password');

    const token = jwt.sign({ userId: user.id }, 'secretKey');
    res.json({ token });
});

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);
    
    socket.on('join_game', (token) => {
        const decoded = authenticate(token);
        if (!decoded) {
            socket.emit('error', 'Authentication failed');
            return;
        }

        const player = { id: socket.id, userId: decoded.userId, username: `Player${decoded.userId}` };
        addPlayer(player);
        io.emit('update_players', players);

        // Game matchmaking logic (simple version)
        const opponent = players.find(p => p.userId !== player.userId);
        if (opponent) {
            socket.emit('game_start', { message: 'Match found!' });
            io.to(opponent.id).emit('game_start', { message: 'Match found!' });
        }

        socket.on('disconnect', () => {
            removePlayer(socket.id);
            io.emit('update_players', players);
            console.log('user disconnected');
        });
    });
});

// Start Server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
