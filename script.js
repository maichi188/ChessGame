const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status-text');

// 1. Khởi tạo "Bộ não" cờ vua từ thư viện chess.js
const game = new Chess();

// 2. Từ điển Ký tự Unicode của các quân cờ (Hình dáng đặc ruột)
const pieceSymbols = {
    'k': '♚', // Vua
    'q': '♛', // Hậu
    'r': '♜', // Xe
    'b': '♝', // Tượng
    'n': '♞', // Mã
    'p': '♟'  // Tốt
};

// 3. Hàm vẽ lại toàn bộ bàn cờ dựa trên "Bộ não"
function renderBoard() {
    boardElement.innerHTML = ''; // Dọn sạch bàn cờ cũ
    
    // Lấy tình trạng hiện tại của 64 ô từ thư viện (ma trận 8x8)
    const board = game.board(); 
    
    // Lặp qua 8 hàng và 8 cột
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
            // Xen kẽ màu nền ô Sáng / Tối
            if ((row + col) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }
            
            // Kiểm tra xem ô này có quân cờ không
            const piece = board[row][col];
            if (piece) {
                // Nhét ký tự quân cờ vào ô
                square.textContent = pieceSymbols[piece.type];
                
                // Phân loại màu sắc quân Trắng / Đen
                if (piece.color === 'w') {
                    square.style.color = 'white'; // Quân trắng
                    // Tạo viền đen bao quanh quân trắng để không bị chìm vào ô sáng
                    square.style.textShadow = '2px 2px 4px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
                } else {
                    square.style.color = 'black'; // Quân đen
                }
            }
            
            // Đưa ô cờ vào khung bàn cờ
            boardElement.appendChild(square);
        }
    }
    
    // Cập nhật trạng thái
    updateStatus();
}

// 4. Hàm cập nhật dòng chữ "Lượt của..."
function updateStatus() {
    let moveColor = game.turn() === 'w' ? 'Trắng' : 'Đen';
    statusElement.textContent = 'Lượt của ' + moveColor;
}

// Chạy hàm vẽ bàn cờ lần đầu tiên ngay khi mở web
renderBoard();
