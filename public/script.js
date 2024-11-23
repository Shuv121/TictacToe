const socket = io();
let player = ''; // Player X or O
let gameBoard = ['', '', '', '', '', '', '', '', '']; // Empty board

// Get the game board and other elements
const board = document.getElementById('game-board');
const resetButton = document.getElementById('reset-btn');
const playerIndicator = document.getElementById('player-indicator');

// Create the game board dynamically
function createBoard() {
    board.innerHTML = ''; // Clear any existing board
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }
}

// Update the player indicator
function updatePlayerIndicator(message) {
    playerIndicator.textContent = message;
}

// Handle cell click
function handleCellClick(event) {
    const index = event.target.dataset.index;

    // Prevent click if the cell is already filled
    if (gameBoard[index] !== '' || player === '') {
        return;
    }

    // Send the move to the server
    socket.emit('playerMove', { index: index, player: player });
}

// Reset the game
function resetGame() {
    socket.emit('resetGame');
}

// Listen for updates from the server
socket.on('playerAssigned', (data) => {
    player = data.player;
    updatePlayerIndicator(`Player ${player}'s turn`);
    createBoard();
});

socket.on('gameFull', () => {
    updatePlayerIndicator('Game is full, please wait...');
});

socket.on('updateBoard', (boardState) => {
    gameBoard = boardState;
    updateBoardUI();
});

socket.on('gameOver', (message) => {
    setTimeout(() => alert(message), 100);
    createBoard();
});

// Update the UI with the current game state
function updateBoardUI() {
    const cells = board.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = gameBoard[index] !== '' ? gameBoard[index] : '';
    });
}

// Attach the reset button action
resetButton.addEventListener('click', resetGame);

