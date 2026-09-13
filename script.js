const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status-text');

const game = new Chess();
const pieceSymbols = { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' };

// Hai biến dùng để ghi nhớ hành động của bạn
let sourceSquare = null; // Ghi nhớ ô bạn vừa nhấp vào (VD: Bạn nhấp vào a2)
let validMoves = [];     // Danh sách các ô được phép đi tới (VD: a3, a4)

function renderBoard() {
    boardElement.innerHTML = ''; 
    const board = game.board(); 
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const squareDiv = document.createElement('div');
            squareDiv.classList.add('square');
            
            if ((row + col) % 2 === 0) squareDiv.classList.add('light');
            else squareDiv.classList.add('dark');
            
            // Đặt tên tọa độ cho ô cờ (VD: Từ hàng/cột số thành a1, b2, h8...)
            const file = String.fromCharCode(97 + col); 
            const rank = 8 - row;
            const squareId = file + rank;
            
            // Tô màu Vàng nếu ô này đang được chọn
            if (sourceSquare === squareId) {
                squareDiv.classList.add('selected');
            }
            // Tô khung Xanh Lá nếu ô này nằm trong danh sách được phép đi
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
            
            // Cài đặt "Cảm ứng": Khi click vào ô này thì chạy hàm xử lý
            squareDiv.addEventListener('click', () => handleSquareClick(squareId));
            
            boardElement.appendChild(squareDiv);
        }
    }
    
    updateStatus();
}

// Hàm xử lý khi người dùng Click chuột / Chạm cảm ứng vào bàn cờ
function handleSquareClick(squareId) {
    const turn = game.turn(); // Kiểm tra xem đang đến lượt màu nào
    
    // TRƯỜNG HỢP 1: Bạn chưa chọn quân nào
    if (sourceSquare === null) {
        const piece = game.get(squareId);
        // Nếu ô vừa bấm có quân cờ VÀ quân đó đúng với lượt hiện tại (bấm đúng quân mình)
        if (piece && piece.color === turn) {
            sourceSquare = squareId; // Ghi nhớ ô đang chọn
            // Hỏi thư viện chess.js xem quân này đi được những đâu
            const moves = game.moves({ square: squareId, verbose: true });
            validMoves = moves.map(m => m.to); // Trích xuất ra danh sách ô đích
            renderBoard(); // Vẽ lại bàn cờ để hiện màu
        }
    } 
    // TRƯỜNG HỢP 2: Bạn đã nhấp chọn quân trước đó rồi, giờ nhấp chọn ô đích
    else {
        // Nếu ô nhấp vào CÓ NẰM TRONG danh sách được phép đi
        if (validMoves.includes(squareId)) {
            // Ra lệnh di chuyển
            game.move({
                from: sourceSquare,
                to: squareId,
                promotion: 'q' // Tự động phong Hậu nếu Tốt đi tới đáy
            });
            // Xóa bộ nhớ và vẽ lại bàn cờ
            sourceSquare = null;
            validMoves = [];
            renderBoard();
        } 
        // Nếu ô nhấp vào KHÔNG HỢP LỆ
        else {
            const piece = game.get(squareId);
            // Có thể bạn muốn đổi sang chọn quân khác của mình?
            if (piece && piece.color === turn) {
                sourceSquare = squareId;
                const moves = game.moves({ square: squareId, verbose: true });
                validMoves = moves.map(m => m.to);
            } else {
                // Bấm ra ngoài hoặc bấm bậy -> Hủy chọn hoàn toàn
                sourceSquare = null;
                validMoves = [];
            }
            renderBoard();
        }
    }
}

function updateStatus() {
    let moveColor = game.turn() === 'w' ? 'Trắng' : 'Đen';
    statusElement.textContent = 'Lượt của ' + moveColor;
}

renderBoard();