let currentUser = "";
let currentElo = 1000;
let isEloAwarded = false; 

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username-input');
const btnLogin = document.getElementById('btn-login');
const displayName = document.getElementById('display-name');
const displayElo = document.getElementById('display-elo');
const displayBotError = document.getElementById('display-bot-error');

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status-text');
const btnPvP = document.getElementById('btn-pvp');
const btnPvE = document.getElementById('btn-pve');
const btnNewGame = document.getElementById('btn-new-game');

const game = new Chess();
const pieceSymbols = { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' };
const pieceValues = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };

// === BẢN ĐỒ NHIỆT ĐÃ ĐƯỢC TỐI ƯU HÓA HOÀN CHỈNH ===
const pst = {
    'p': [ // Tốt: Khuyến khích chiếm trung tâm ở khai cuộc, đẩy mạnh bạo ở cuối trận
        [0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 15, 20, 30, 30, 20, 15, 10],
        [5,  10, 15, 25, 25, 15, 10,  5],
        [0,   5, 10, 20, 20, 10,  5,  0],
        [5,  -5,-10,  0,  0,-10, -5,  5],
        [5,  10, 10,-20,-20, 10, 10,  5],
        [0,   0,  0,  0,  0,  0,  0,  0]
    ],
    'p_e': [ // Tốt tàn cuộc: Xung phong tuyệt đối khi không còn quân cản trở
        [0,   0,   0,   0,   0,   0,   0,   0],
        [90,  90,  90,  90,  90,  90,  90,  90],
        [60,  60,  60,  60,  60,  60,  60,  60],
        [40,  40,  40,  40,  40,  40,  40,  40],
        [20,  20,  20,  20,  20,  20,  20,  20],
        [10,  10,  10,  10,  10,  10,  10,  10],
        [0,    0,   0,   0,   0,   0,   0,   0],
        [0,    0,   0,   0,   0,   0,   0,   0]
    ],
    'n': [ // Mã: Ép buộc phải ra trung tâm (e4, d4, e5, d5), cấm kỵ chui rúc góc
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    'b': [ // Tượng: Kiểm soát đường chéo dài, tránh đứng chắn ở hàng 1
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    'r': [ // Xe: Thích kiểm soát các hàng trống và chiếm hàng ngang trọng yếu
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [ 5, 10, 10, 10, 10, 10, 10,  5],
        [ -2,  0,  0,  0,  0,  0,  0, -2],
        [ -2,  0,  0,  0,  0,  0,  0, -2],
        [ -2,  0,  0,  0,  0,  0,  0, -2],
        [ -2,  0,  0,  0,  0,  0,  0, -2],
        [ -2,  0,  0,  0,  0,  0,  0, -2],
        [ 0,  0,  0,  5,  5,  0,  0,  0]
    ],
    'q': [ // Hậu: Cân đối giữa việc hỗ trợ tấn công và không lộ mình quá sớm
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-10,  5,  5,  5,  5,  5,  5,-10],
        [  0,  0,  5,  5,  5,  5,  0,  0],
        [ -5,  0,  5,  5,  5,  5,  0, -5],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    'k': [ // Vua Khai cuộc: Ẩn nấp an toàn tuyệt đối ở 2 góc (Nhập thành)
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [ 20, 20,  0,  0,  0,  0, 20, 20],
        [ 20, 30, 10,  0,  0, 10, 30, 20]
    ],
    'k_e': [ // Vua Tàn cuộc: Chủ động tham gia giao tranh ở trung tâm
        [-50,-40,-30,-20,-20,-30,-40,-50],
        [-30,-20,-10,  0,  0,-10,-20,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-30,  0,  0,  0,  0,-30,-30],
        [-50,-30,-30,-30,-30,-30,-30,-50]
    ]
};

let sourceSquare = null; 
let validMoves = [];     
let isPvE = false; 

function getBotErrorRate(elo) {
    if (elo < 900) return 0.60 - (elo / 900) * 0.20;
    else if (elo < 1100) return 0.40 - ((elo - 900) / 200) * 0.10;
    else if (elo < 1300) return 0.30 - ((elo - 1100) / 200) * 0.20;
    else if (elo < 1500) return 0.10 - ((elo - 1300) / 200) * 0.10;
    else return 0;
}

btnLogin.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name !== "") {
        currentUser = name;
        const savedElo = localStorage.getItem('chessElo_' + name);
        if (savedElo) currentElo = parseInt(savedElo); 
        else {
            currentElo = 1000; 
            localStorage.setItem('chessElo_' + name, currentElo);
        }
        
        displayName.textContent = currentUser;
        displayElo.textContent = currentElo;
        displayBotError.textContent = (getBotErrorRate(currentElo) * 100).toFixed(1);
        
        loginScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        renderBoard();
    } else {
        alert("Vui lòng nhập tên của bạn nhé!");
    }
});

function resetGame() {
    game.reset();
    sourceSquare = null;
    validMoves = [];
    isEloAwarded = false; 
    
    const moveQualityElement = document.getElementById('move-quality');
    moveQualityElement.textContent = "Phán quyết: Mới bắt đầu";
    moveQualityElement.style.color = "#bdc3c7";
    
    renderBoard();
}

btnPvP.addEventListener('click', () => {
    isPvE = false;
    btnPvP.classList.add('active');
    btnPvE.classList.remove('active');
    resetGame();
});

btnPvE.addEventListener('click', () => {
    isPvE = true;
    btnPvE.classList.add('active');
    btnPvP.classList.remove('active');
    resetGame();
});

btnNewGame.addEventListener('click', () => {
    resetGame();
});

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
            
            if (sourceSquare === squareId) squareDiv.classList.add('selected');
            if (validMoves.includes(squareId)) squareDiv.classList.add('highlight');
            
            const piece = board[row][col];
            if (piece) {
                squareDiv.textContent = pieceSymbols[piece.type] + '\uFE0E';
                if (piece.color === 'w') squareDiv.classList.add('piece-white');
                else squareDiv.classList.add('piece-black');
            }
            
            squareDiv.addEventListener('click', () => handleSquareClick(squareId));
            boardElement.appendChild(squareDiv);
        }
    }
    updateStatus();
    updateEvalBar(); 
}

function handleSquareClick(squareId) {
    if (game.game_over()) return;
    if (isPvE && game.turn() === 'b') return;

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
            let oldScore = evaluateBoard(); 
            game.move({ from: sourceSquare, to: squareId, promotion: 'q' });
            assessMoveQuality(oldScore, turn);
            sourceSquare = null;
            validMoves = [];
            renderBoard();
            
            if (isPvE && !game.game_over()) {
                setTimeout(makeBotMove, 250); 
            }
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

function evaluateBoard() {
    let totalScore = 0;
    let nonPawnMaterial = 0; 
    const board = game.board();

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.type !== 'p' && piece.type !== 'k') {
                nonPawnMaterial += pieceValues[piece.type];
            }
        }
    }

    let isEndgame = nonPawnMaterial < 2000;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                let value = pieceValues[piece.type];
                let pstRow = (piece.color === 'w') ? row : (7 - row);
                let pstTable = pst[piece.type];
                
                if (isEndgame && piece.type === 'k') pstTable = pst['k_e'];
                if (isEndgame && piece.type === 'p') pstTable = pst['p_e'];

                let pstValue = pstTable[pstRow][col];
                
                if (piece.color === 'w') {
                    totalScore += (value + pstValue); 
                } else {
                    totalScore -= (value + pstValue); 
                }
            }
        }
    }
    return totalScore;
}

function updateEvalBar() {
    const score = evaluateBoard();
    const evalText = document.getElementById('eval-text');
    const evalFill = document.getElementById('eval-fill');

    let blackPercent = 50 - (score / 1500) * 50;
    if (blackPercent < 0) blackPercent = 0;
    if (blackPercent > 100) blackPercent = 100;
    
    evalFill.style.width = blackPercent + '%';

    if (score > 100) evalText.textContent = "Trắng đang có lợi thế";
    else if (score < -100) evalText.textContent = "Đen đang có lợi thế";
    else evalText.textContent = "Thế trận cân bằng";
}

function assessMoveQuality(oldScore, moveColor) {
    if (game.game_over()) {
        const moveQualityElement = document.getElementById('move-quality');
        if (game.in_checkmate()) {
            moveQualityElement.textContent = "Phán quyết: THIÊN TÀI 🌟 (Chiếu Bí)";
            moveQualityElement.style.color = "#2ecc71";
        }
        return;
    }

    let newScore = evaluateBoard(); 
    let opponentMoves = game.moves({ verbose: true });
    let maxThreatValue = 0;
    
    for (let i = 0; i < opponentMoves.length; i++) {
        let move = opponentMoves[i];
        if (move.captured) {
            let pieceValue = pieceValues[move.captured];
            if (pieceValue > maxThreatValue) {
                maxThreatValue = pieceValue;
            }
        }
    }
    
    let perceivedScore = newScore;
    if (moveColor === 'w') perceivedScore -= maxThreatValue; 
    else perceivedScore += maxThreatValue; 

    let change = (moveColor === 'w') ? (perceivedScore - oldScore) : -(perceivedScore - oldScore); 
    
    const moveQualityElement = document.getElementById('move-quality');
    if (change >= 200) {
        moveQualityElement.textContent = "Phán quyết: THIÊN TÀI 🌟 (Pha Highlight)";
        moveQualityElement.style.color = "#2ecc71"; 
    } else if (change <= -200) {
        moveQualityElement.textContent = "Phán quyết: NGỚ NGẨN 💀 (Biếu không quân)";
        moveQualityElement.style.color = "#e74c3c"; 
    } else {
        moveQualityElement.textContent = "Phán quyết: Bình thường";
        moveQualityElement.style.color = "#bdc3c7"; 
    }
}

function orderMoves(moves) {
    return moves.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.captured) scoreA += 10 * pieceValues[a.captured] - pieceValues[a.piece];
        if (b.captured) scoreB += 10 * pieceValues[b.captured] - pieceValues[b.piece];
        if (a.flags.includes('p')) scoreA += 9000;
        if (b.flags.includes('p')) scoreB += 9000;
        return scoreB - scoreA; 
    });
}

function quiesce(alpha, beta, isMaximizingPlayer) {
    let evaluation = evaluateBoard();
    
    if (isMaximizingPlayer) {
        if (evaluation >= beta) return beta;
        if (evaluation > alpha) alpha = evaluation;
    } else {
        if (evaluation <= alpha) return alpha;
        if (evaluation < beta) beta = evaluation;
    }

    let moves = game.moves({ verbose: true }).filter(m => m.captured);
    moves = orderMoves(moves); 

    if (isMaximizingPlayer) {
        let bestVal = evaluation;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            let score = quiesce(alpha, beta, !isMaximizingPlayer);
            game.undo();
            bestVal = Math.max(bestVal, score);
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    } else {
        let bestVal = evaluation;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            let score = quiesce(alpha, beta, !isMaximizingPlayer);
            game.undo();
            bestVal = Math.min(bestVal, score);
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
}

function minimax(depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || game.game_over()) {
        return quiesce(alpha, beta, isMaximizingPlayer);
    }

    let moves = game.moves({ verbose: true });
    moves = orderMoves(moves); 
    
    if (isMaximizingPlayer) { 
        let bestVal = -999999;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            bestVal = Math.max(bestVal, minimax(depth - 1, alpha, beta, !isMaximizingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break; 
        }
        return bestVal;
    } else { 
        let bestVal = 999999;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            let bestValLocal = minimax(depth - 1, alpha, beta, !isMaximizingPlayer);
            bestVal = Math.min(bestVal, bestValLocal);
            game.undo();
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
}

function makeBotMove() {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    let botErrorRate = getBotErrorRate(currentElo);
    let oldScore = evaluateBoard(); 

    if (Math.random() < botErrorRate) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        game.move(randomMove);
        assessMoveQuality(oldScore, 'b'); 
        renderBoard();
        return; 
    }

    let bestMove = null;
    let bestScore = 999999; 
    const SEARCH_DEPTH = 3; 

    let moves = orderMoves(possibleMoves); 

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        game.move(move);           
        const score = minimax(SEARCH_DEPTH - 1, -999999, 999999, true); 
        game.undo();               

        if (score < bestScore || (score === bestScore && Math.random() < 0.5)) {
            bestScore = score;
            bestMove = move;
        }
    }

    game.move(bestMove);
    assessMoveQuality(oldScore, 'b'); 
    renderBoard();
}

function updateStatus() {
    let statusText = '';
    let moveColor = game.turn() === 'w' ? 'Trắng' : 'Đen';
    statusElement.style.color = 'white';
    
    if (game.in_checkmate()) {
        let winner = game.turn() === 'w' ? 'Đen' : 'Trắng'; 
        statusText = 'CHIẾU BÍ! Phe ' + winner + ' Thắng!';
        statusElement.style.color = '#ff4757'; 

        if (isPvE && !isEloAwarded) {
            if (winner === 'Trắng') currentElo += 15; 
            else {
                currentElo -= 15; 
                if (currentElo < 0) currentElo = 0;
            }
            
            localStorage.setItem('chessElo_' + currentUser, currentElo);
            displayElo.textContent = currentElo;
            displayBotError.textContent = (getBotErrorRate(currentElo) * 100).toFixed(1);
            
            isEloAwarded = true; 
        }
    } 
    else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
        statusText = 'VÁN ĐẤU HÒA!';
        statusElement.style.color = '#ffa502'; 
        isEloAwarded = true;
    } 
    else {
        statusText = 'Lượt của ' + moveColor;
        if (game.in_check()) {
            statusText += ' (Đang bị Chiếu!)';
            statusElement.style.color = '#ff4757'; 
        }
    }
    statusElement.textContent = statusText;
}