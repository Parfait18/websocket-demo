const { io } = require('socket.io-client');

const socket = io('http://localhost:3000/standard-chat');

socket.on('connect', () => {
    console.log('Connected to server');
    
    // Set username
    socket.emit('setUsername', 'TestUser');
    
    // Send a test message
    socket.emit('chatMessage', 'Hello from Node.js client!');
});

socket.on('message', (data) => {
    console.log('Received message:', data);
});

socket.on('userList', (users) => {
    console.log('Active users:', users);
});