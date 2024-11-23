// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create the Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store the game state
let players = []; // Will hold the two players' sockets
let gameBoard = ['', '', '', '', '', '', '', '', '']; // Represents the board (9 empty cells)

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

// When a player connects to the server
io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Assign the player to the game
    if (players.length < 2) {
        players.push(socket.id);
        const player = players.length === 1 ? 'X' : 'O'; // Assign 'X' to the first player, 'O' to the second player
        socket.emit('playerAssigned', { player }); // Send the player type to the connected player
    } else {
        socket.emit('gameFull'); // Inform the third player that the game is full
        return;
    }

    // Handle player moves
    socket.on('playerMove', (data) => {
        const { index, player } = data;

        // Check if the cell is empty and if it's the player's turn
        if (gameBoard[index] === '' && player === (players.indexOf(socket.id) === 0 ? 'X' : 'O')) {
            gameBoard[index] = player; // Update the game board with the player's move
            io.emit('updateBoard', gameBoard); // Broadcast the updated board to both players

            // Check if the game has a winner
            if (checkWinner()) {
                io.emit('gameOver', `${player} wins!`);
                resetGame();
            } else if (!gameBoard.includes('')) {
                io.emit('gameOver', 'It\'s a draw!');
                resetGame();
            }
        }
    });

    // Handle game reset
    socket.on('resetGame', () => {
        resetGame();
        io.emit('updateBoard', gameBoard);
    });

    // When a player disconnects, remove them from the player list
    socket.on('disconnect', () => {
        console.log('A player disconnected:', socket.id);
        players = players.filter(player => player !== socket.id);
    });
});

// Function to check for a winner
function checkWinner() {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    // Check if any of the win patterns have matching values
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return true;
        }
    }
    return false;
}

// Function to reset the game state
function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    players = []; // Clear the players list
}

// Start the server and listen on port 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
