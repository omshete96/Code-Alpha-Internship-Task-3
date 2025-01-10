const socket = io();
let token = '';

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.token) {
        token = data.token;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('game-section').style.display = 'block';
        socket.emit('join_game', token);
    } else {
        alert('Login failed');
    }
});

socket.on('update_players', (players) => {
    const playersDiv = document.getElementById('players');
    playersDiv.innerHTML = '';
    players.forEach(player => {
        playersDiv.innerHTML += `<p>${player.username}</p>`;
    });
});

socket.on('game_start', (data) => {
    alert(data.message);
});
