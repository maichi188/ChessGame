const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status-text');

const game = new Chess();
const pieceSymbols = { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' };

let sourceSquare = null; 
let validMoves = [];     

function renderBoard() {
    boardElement.innerHTML = ''; 
    const board = game.board(); 
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const squareDiv = document.createElement('div');
            squareDiv.classList.add('square');
            
            if ((row + col) % 2 === 0) squareDiv.classList.add('light');
            else squareDiv.classList.add('dark');
            
            const file = String.fromCharCode(97 + col); 
            const rank = 8 - row;
            const squareId = file + rank;
            
            if (sourceSquare === squareId) {
                squareDiv.classList.add('selected');
            }
            if (validMoves.includes(squareId)) {
                squareDiv.classList.add('highlight');
            }
            
            const piece = board[row][col];
            if (piece) {
                squareDiv.textContent = pieceSymbols[piece.type] + '\uFE0E';
                if (piece.color === 'w') {
                    squareDiv.classList.add('piece-white');
                } else {
                    squareDiv.classList.add('piece-black');
                }
            }
            
            squareDiv.addEventListener('click', () => handleSquareClick(squareId));
            
            boardElement.appendChild(squareDiv);
        }
    }
    
    updateStatus();
}

function handleSquareClick(squareId) {
    // Nếu game đã kết thúc (Chiếu bí/Hòa) thì KHÔNG làm gì cả (khóa bàn cờ)
    if (game.game_over()) return;

    const turn = game.turn(); 
    
    if (sourceSquare === null) {
        const piece = game.get(squareId);
        if (piece && piece.color === turn) {
            sourceSquare = squareId; 
            const moves = game.moves({ square: squareId, verbose: true });
            validMoves = moves.map(m => m.to); 
            renderBoard(); 
        }
    } 
    else {
        if (validMoves.includes(squareId)) {
            game.move({
                from: sourceSquare,
                to: squareId,
                promotion: 'q' 
            });
            sourceSquare = null;
            validMoves = [];
            renderBoard();
        } 
        else {
            const piece = game.get(squareId);
            if (piece && piece.color === turn) {
                sourceSquare = squareId;
                const moves = game.moves({ square: squareId, verbose: true });
                validMoves = moves.map(m => m.to);
            } else {
                sourceSquare = null;
                validMoves = [];
            }
            renderBoard();
        }
    }
}

function updateStatus() {
    let statusText = '';
    let moveColor = game.turn() === 'w' ? 'Trắng' : 'Đen';
    
    // Đặt màu chữ mặc định là Trắng
    statusElement.style.color = 'white';
    
    // 1. Kiểm tra xem có bị Chiếu Bí (Thua) không
    if (game.in_checkmate()) {
        let winner = game.turn() === 'w' ? 'Đen' : 'Trắng'; 
        statusText = 'CHIẾU BÍ! Phe ' + winner + ' Thắng!';
        statusElement.style.color = '#ff4757'; // Báo màu Đỏ chót
    } 
    // 2. Kiểm tra xem có Hòa không
    else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
        statusText = 'VÁN ĐẤU HÒA!';
        statusElement.style.color = '#ffa502'; // Báo màu Cam
    } 
    // 3. Game đang diễn ra bình thường
    else {
        statusText = 'Lượt của ' + moveColor;
        // Cảnh báo nếu Vua đang bị nhắm tới
        if (game.in_check()) {
            statusText += ' (Đang bị Chiếu!)';
            statusElement.style.color = '#ff4757'; // Báo màu Đỏ chót
        }
    }
    
    statusElement.textContent = statusText;
}

renderBoard();