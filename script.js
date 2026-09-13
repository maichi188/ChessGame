const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status-text');

// 1. Khởi tạo "Bộ não" cờ vua từ thư viện chess.js
const game = new Chess();

// 2. Chỉ dùng 1 bộ ký tự "Đặc ruột" cho to rõ
const pieceSymbols = {
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// 3. Hàm vẽ lại toàn bộ bàn cờ
function renderBoard() {
    boardElement.innerHTML = ''; 
    const board = game.board(); 
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
            if ((row + col) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }
            
            const piece = board[row][col];
            if (piece) {
                // Đặt ký tự
                square.textContent = pieceSymbols[piece.type] + '\uFE0E';
                
                // Gắn class CSS tương ứng với màu phe
                if (piece.color === 'w') {
                    square.classList.add('piece-white');
                } else {
                    square.classList.add('piece-black');
                }
            }
            
            boardElement.appendChild(square);
        }
    }
    
    updateStatus();
}

// 4. Hàm cập nhật trạng thái
function updateStatus() {
    let moveColor = game.turn() === 'w' ? 'Trắng' : 'Đen';
    statusElement.textContent = 'Lượt của ' + moveColor;
}

// Chạy vẽ bàn cờ lần đầu
renderBoard();
