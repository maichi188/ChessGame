const boardElement = document.getElementById('board');

// Hàm tạo giao diện 64 ô cờ trống
function createEmptyBoard() {
    boardElement.innerHTML = ''; // Dọn sạch khung bàn cờ
    
    // Lặp 64 lần để tạo 64 ô
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div'); // Tạo một khối div
        square.classList.add('square');
        
        // Tính toán xem ô này màu Sáng hay Tối
        // Vị trí hàng (từ 0 đến 7)
        const row = Math.floor(i / 8); 
        // Vị trí cột (từ 0 đến 7)
        const col = i % 8; 
        
        // Cứ hàng + cột là số chẵn thì màu Sáng, lẻ thì màu Tối
        if ((row + col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }
        
        // Nhét ô cờ vào trong khung bàn cờ
        boardElement.appendChild(square);
    }
}

// Chạy hàm vẽ bàn cờ ngay khi web tải xong
createEmptyBoard();
