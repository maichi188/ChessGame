let currentUser = "";
let currentElo = 1000;
let isEloAwarded = false; 

let evalHistory = []; 
let lastMoveSquares = []; 

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

// === 1. BỘ 3 TÍNH CÁCH VÀ ĐA BẢN ĐỒ NHIỆT ===
const personalities = {
    'balanced': { 
        pieceValues: { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 },
        pst: {
            'p': [ 
                [0,  0,  0,  0,  0,  0,  0,  0], [50, 50, 50, 50, 50, 50, 50, 50],
                [10, 15, 20, 30, 30, 20, 15, 10], [5,  10, 15, 25, 25, 15, 10,  5],
                [0,   5, 10, 20, 20, 10,  5,  0], [5,  -5,-10,  0,  0,-10, -5,  5],
                [5,  10, 10,-20,-20, 10, 10,  5], [0,   0,  0,  0,  0,  0,  0,  0]
            ],
            'n': [ 
                [-50,-40,-30,-30,-30,-30,-40,-50], [-40,-20,  0,  5,  5,  0,-20,-40],
                [-30,  5, 10, 15, 15, 10,  5,-30], [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30,  5, 15, 20, 20, 15,  5,-30], [-30,  0, 10, 15, 15, 10,  0,-30],
                [-40,-20,  0,  0,  0,  0,-20,-40], [-50,-40,-30,-30,-30,-30,-40,-50]
            ]
        }
    },
    'aggressive': { 
        pieceValues: { 'p': 80,  'n': 350, 'b': 330, 'r': 500, 'q': 1000, 'k': 20000 },
        pst: {
            // Bản đồ Tốt Hổ Báo: Thưởng điểm khổng lồ nếu dám đẩy Tốt sang sân đối phương
            'p': [ 
                [0,  0,  0,  0,  0,  0,  0,  0], [70, 70, 70, 70, 70, 70, 70, 70],
                [30, 40, 50, 60, 60, 50, 40, 30], [20, 30, 40, 50, 50, 40, 30, 20],
                [10, 20, 30, 40, 40, 30, 20, 10], [0,   0,  0, 10, 10,  0,  0,  0],
                [0,   0,  0,-10,-10,  0,  0,  0], [0,   0,  0,  0,  0,  0,  0,  0]
            ],
            // Bản đồ Mã Hổ Báo: Phải lao lên hàng 4, 5, 6
            'n': [ 
                [-50,-40,-30,-30,-30,-30,-40,-50], [-40,-20, 10, 20, 20, 10,-20,-40],
                [-30, 10, 30, 40, 40, 30, 10,-30], [-30, 10, 30, 40, 40, 30, 10,-30],
                [-30, 10, 20, 30, 30, 20, 10,-30], [-30,  0, 10, 15, 15, 10,  0,-30],
                [-40,-20,  0,  0,  0,  0,-20,-40], [-50,-40,-30,-30,-30,-30,-40,-50]
            ]
        }
    },
    'defensive': { 
        pieceValues: { 'p': 130, 'n': 300, 'b': 320, 'r': 550, 'q': 850, 'k': 20000 },
        pst: {
            // Bản đồ Tốt Phòng Thủ: Khuyến khích đứng lì ở nhà tạo tường chắn
            'p': [ 
                [0,  0,  0,  0,  0,  0,  0,  0], [30, 30, 30, 30, 30, 30, 30, 30],
                [10, 10, 10, 10, 10, 10, 10, 10], [5,   5,  5,  5,  5,  5,  5,  5],
                [5,   5, 10, 15, 15, 10,  5,  5], [10, 15, 20, 25, 25, 20, 15, 10],
                [15, 20, 25, 30, 30, 25, 20, 15], [0,   0,  0,  0,  0,  0,  0,  0]
            ],
            // Bản đồ Mã Phòng Thủ: Ưu tiên bay lượn ở nửa sân nhà để bảo vệ
            'n': [ 
                [-50,-40,-30,-30,-30,-30,-40,-50], [-40,-20, -5, -5, -5, -5,-20,-40],
                [-30, -5,  5, 10, 10,  5, -5,-30], [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30, 10, 20, 25, 25, 20, 10,-30], [-30, 15, 25, 30, 30, 25, 15,-30],
                [-40,-10, 10, 15, 15, 10,-10,-40], [-50,-40,-30,-30,-30,-30,-40,-50]
            ]
        }
    }
};

// Các quân không thay đổi nhiều chiến thuật (Tượng, Xe, Hậu, Vua) dùng chung bản đồ này
const pst_common = {
    'b': [ 
        [-20,-10,-10,-10,-10,-10,-10,-20], [-10,  5,  0,  0,  0,  0,  5,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10], [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10], [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  0,  0,  0,  0,  0,  0,-10], [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    'r': [ 
        [ 0,  0,  0,  0,  0,  0,  0,  0], [ 5, 10, 10, 10, 10, 10, 10,  5],
        [ -2,  0,  0,  0,  0,  0,  0, -2], [ -2,  0,  0,  0,  0,  0,  0, -2],
        [ -2,  0,  0,  0,  0,  0,  0, -2], [ -2,  0,  0,  0,  0,  0,  0, -2],
        [ -2,  0,  0,  0,  0,  0,  0, -2], [ 0,  0,  0,  5,  5,  0,  0,  0]
    ],
    'q': [ 
        [-20,-10,-10, -5, -5,-10,-10,-20], [-10,  0,  5,  0,  0,  0,  0,-10],
        [-10,  5,  5,  5,  5,  5,  5,-10], [  0,  0,  5,  5,  5,  5,  0,  0],
        [ -5,  0,  5,  5,  5,  5,  0, -5], [-10,  0,  5,  5,  5,  5,  0,-10],
        [-10,  0,  0,  0,  0,  0,  0,-10], [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    'k': [ 
        [-30,-40,-40,-50,-50,-40,-40,-30], [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30], [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20], [-10,-20,-20,-20,-20,-20,-20,-10],
        [ 20, 20,  0,  0,  0,  0, 20, 20], [ 20, 30, 10,  0,  0, 10, 30, 20]
    ],
    'k_e': [ 
        [-50,-40,-30,-20,-20,-30,-40,-50], [-30,-20,-10,  0,  0,-10,-20,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30], [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30], [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-30,  0,  0,  0,  0,-30,-30], [-50,-30,-30,-30,-30,-30,-30,-50]
    ],
    'p_e': [ 
        [0, 0, 0, 0, 0, 0, 0, 0], [90, 90, 90, 90, 90, 90, 90, 90],
        [60, 60, 60, 60, 60, 60, 60, 60], [40, 40, 40, 40, 40, 40, 40, 40],
        [20, 20, 20, 20, 20, 20, 20, 20], [10, 10, 10, 10, 10, 10, 10, 10],
        [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]
    ]
};

let currentBotPersonality = 'balanced'; 

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
        resetGame(); 
    } else {
        alert("Vui lòng nhập tên của bạn nhé!");
    }
});

function resetGame() {
    game.reset();
    sourceSquare = null;
    validMoves = [];
    isEloAwarded = false; 
    evalHistory = [];
    lastMoveSquares = [];
    
    // TỰ ĐỘNG CHỌN NGẦM TÍNH CÁCH (Xổ số ẩn)
    const types = ['balanced', 'aggressive', 'defensive'];
    currentBotPersonality = types[Math.floor(Math.random() * types.length)];
    
    const moveQualityElement = document.getElementById('move-quality');
    moveQualityElement.textContent = "Phán quyết: Mới bắt đầu";
    moveQualityElement.style.color = "#bdc3c7";
    
    renderBoard();
}

btnPvP.addEventListener('click', () => { isPvE = false; btnPvP.classList.add('active'); btnPvE.classList.remove('active'); resetGame(); });
btnPvE.addEventListener('click', () => { isPvE = true; btnPvE.classList.add('active'); btnPvP.classList.remove('active'); resetGame(); });
btnNewGame.addEventListener('click', () => { resetGame(); });

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
            if (lastMoveSquares.includes(squareId)) squareDiv.classList.add('last-move');
            
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
            let oldScore = evaluateBoard(false); 
            let moveObj = game.move({ from: sourceSquare, to: squareId, promotion: 'q' });
            
            if (moveObj) {
                lastMoveSquares = [moveObj.from, moveObj.to]; 
                assessMoveQuality(oldScore, turn);
                sourceSquare = null;
                validMoves = [];
                renderBoard();
                
                if (isPvE && !game.game_over()) {
                    setTimeout(makeBotMove, 250); 
                }
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

// BỘ ĐẾM ĐIỂM: Áp dụng Đa Bản đồ
function evaluateBoard(isForBot = false) {
    let totalScore = 0;
    let nonPawnMaterial = 0; 
    const board = game.board();
    
    let pVals = isForBot ? personalities[currentBotPersonality].pieceValues : personalities['balanced'].pieceValues;
    let activePST = isForBot ? personalities[currentBotPersonality].pst : personalities['balanced'].pst;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.type !== 'p' && piece.type !== 'k') {
                nonPawnMaterial += pVals[piece.type];
            }
        }
    }

    let isEndgame = nonPawnMaterial < 2000;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                let value = pVals[piece.type];
                let pstRow = (piece.color === 'w') ? row : (7 - row);
                
                // Lấy bản đồ đặc chế hoặc bản đồ chung
                let pstTable = activePST[piece.type] || pst_common[piece.type];
                
                if (isEndgame && piece.type === 'k') pstTable = pst_common['k_e'];
                if (isEndgame && piece.type === 'p') pstTable = pst_common['p_e'];

                let pstValue = pstTable[pstRow][col];
                
                if (piece.color === 'w') totalScore += (value + pstValue); 
                else totalScore -= (value + pstValue); 
            }
        }
    }
    return totalScore;
}

function updateEvalBar() {
    const score = evaluateBoard(false); 
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

    let immediateScore = evaluateBoard(false); 
    let isMax = game.turn() === 'w'; 
    let futureScore = minimax(2, -999999, 999999, isMax, false); 
    
    let changeImmediate = (moveColor === 'w') ? (immediateScore - oldScore) : -(immediateScore - oldScore); 
    let changeFuture = (moveColor === 'w') ? (futureScore - oldScore) : -(futureScore - oldScore); 
    
    const moveQualityElement = document.getElementById('move-quality');
    
    if (changeImmediate <= -150 && changeFuture >= 100) {
        moveQualityElement.textContent = "Phán quyết: ĐỘT PHÁ 🔥 (Thí quân gài bẫy)";
        moveQualityElement.style.color = "#f39c12"; 
    } 
    else if (changeImmediate >= 100 && changeFuture <= -100) {
        moveQualityElement.textContent = "Phán quyết: SẬP BẪY ⚠️ (Tham ăn hối hận)";
        moveQualityElement.style.color = "#e67e22"; 
    } 
    else if (changeFuture >= 150) {
        moveQualityElement.textContent = "Phán quyết: TỐT TỐI ĐA 🌟";
        moveQualityElement.style.color = "#2ecc71"; 
    } 
    else if (changeFuture >= 50) {
        moveQualityElement.textContent = "Phán quyết: Tốt 👍";
        moveQualityElement.style.color = "#3498db"; 
    } 
    else if (changeFuture <= -150) {
        moveQualityElement.textContent = "Phán quyết: NGỚ NGẨN 💀";
        moveQualityElement.style.color = "#e74c3c"; 
    } 
    else {
        moveQualityElement.textContent = "Phán quyết: Bình thường";
        moveQualityElement.style.color = "#bdc3c7"; 
    }
}

function orderMoves(moves, isForBot) {
    let pVals = isForBot ? personalities[currentBotPersonality].pieceValues : personalities['balanced'].pieceValues;
    return moves.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        if (a.captured) scoreA += 10 * pVals[a.captured] - pVals[a.piece];
        if (b.captured) scoreB += 10 * pVals[b.captured] - pVals[b.piece];
        if (a.flags.includes('p')) scoreA += 9000;
        if (b.flags.includes('p')) scoreB += 9000;
        return scoreB - scoreA; 
    });
}

function quiesce(alpha, beta, isMaximizingPlayer, isForBot = false) {
    const positionEval = evaluateBoard(isForBot);
    if (isMaximizingPlayer) {
        if (positionEval >= beta) return beta;
        if (positionEval > alpha) alpha = positionEval;
    } else {
        if (positionEval <= alpha) return alpha;
        if (positionEval < beta) beta = positionEval;
    }
    let moves = game.moves({ verbose: true }).filter(m => m.captured);
    moves = orderMoves(moves, isForBot); 
    if (isMaximizingPlayer) {
        let bestVal = positionEval;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            let score = quiesce(alpha, beta, !isMaximizingPlayer, isForBot);
            game.undo();
            bestVal = Math.max(bestVal, score);
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    } else {
        let bestVal = positionEval;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            let score = quiesce(alpha, beta, !isMaximizingPlayer, isForBot);
            game.undo();
            bestVal = Math.min(bestVal, score);
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
}

function minimax(depth, alpha, beta, isMaximizingPlayer, isForBot = false) {
    if (depth === 0 || game.game_over()) return quiesce(alpha, beta, isMaximizingPlayer, isForBot);
    let moves = game.moves({ verbose: true });
    moves = orderMoves(moves, isForBot); 
    if (isMaximizingPlayer) { 
        let bestVal = -999999;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            bestVal = Math.max(bestVal, minimax(depth - 1, alpha, beta, !isMaximizingPlayer, isForBot));
            game.undo();
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break; 
        }
        return bestVal;
    } else { 
        let bestVal = 999999;
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            let bestValLocal = minimax(depth - 1, alpha, beta, !isMaximizingPlayer, isForBot);
            bestVal = Math.min(bestVal, bestValLocal);
            game.undo();
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
}

// === TƯ DUY CẢM TÍNH (FUZZY LOGIC) - LỰA CHỌN GIỐNG CON NGƯỜI ===
function makeBotMove() {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    let botErrorRate = getBotErrorRate(currentElo);
    let oldScore = evaluateBoard(false); 

    if (Math.random() < botErrorRate) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        let moveObj = game.move(randomMove);
        lastMoveSquares = [moveObj.from, moveObj.to]; 
        assessMoveQuality(oldScore, 'b'); 
        renderBoard();
        return; 
    }

    const SEARCH_DEPTH = 3; 
    let moves = orderMoves(possibleMoves, true); 
    
    let bestScore = 999999; // Mục tiêu của Đen là tìm điểm số Âm nhất
    let scoredMoves = [];

    // Chấm điểm toàn bộ các nước có thể đi
    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        game.move(move);           
        const score = minimax(SEARCH_DEPTH - 1, -999999, 999999, true, true); 
        game.undo();               

        scoredMoves.push({ move: move, score: score });
        if (score < bestScore) {
            bestScore = score;
        }
    }

    // Lọc ra danh sách các nước đi "Ngon ngang ngửa nhau" (Chênh lệch không quá 30 điểm)
    let topMoves = scoredMoves.filter(m => m.score <= bestScore + 30);
    
    // Máy tính sẽ tung xúc xắc chọn ngẫu nhiên 1 trong các nước đi xuất sắc này
    let chosenMove = topMoves[Math.floor(Math.random() * topMoves.length)].move;

    let moveObj = game.move(chosenMove);
    if(moveObj) lastMoveSquares = [moveObj.from, moveObj.to]; 
    
    assessMoveQuality(oldScore, 'b'); 
    renderBoard();
}

function updateStatus() {
    let statusText = '';
    let moveColor = game.turn() === 'w' ? 'Trắng' : 'Đen';
    statusElement.style.color = 'white';
    
    evalHistory.push(evaluateBoard(false));
    
    if (game.in_checkmate()) {
        let winner = game.turn() === 'w' ? 'Đen' : 'Trắng'; 
        
        let sumEval = evalHistory.reduce((a, b) => a + b, 0);
        let avgEval = sumEval / (evalHistory.length || 1);
        let eloChange = 15;
        let eloMsg = "";

        if (isPvE && !isEloAwarded) {
            if (winner === 'Trắng') {
                if (avgEval < -200) { eloChange = 25; eloMsg = " (Lật kèo ngoạn mục! +25 Elo)"; } 
                else if (avgEval > 300) { eloChange = 10; eloMsg = " (Thắng áp đảo dễ dàng! +10 Elo)"; } 
                else { eloChange = 15; eloMsg = " (Chiến thắng tiêu chuẩn! +15 Elo)"; }
                currentElo += eloChange;
            } else {
                if (avgEval > 200) { eloChange = 25; eloMsg = " (Cầm vàng lại để vàng rơi! -25 Elo)"; } 
                else if (avgEval < -300) { eloChange = 10; eloMsg = " (Đối thủ quá mạnh! -10 Elo)"; } 
                else { eloChange = 15; eloMsg = " (Thất bại tiêu chuẩn! -15 Elo)"; }
                currentElo -= eloChange; 
                if (currentElo < 0) currentElo = 0;
            }
            
            localStorage.setItem('chessElo_' + currentUser, currentElo);
            displayElo.textContent = currentElo;
            displayBotError.textContent = (getBotErrorRate(currentElo) * 100).toFixed(1);
            isEloAwarded = true; 
        }
        
        statusText = 'CHIẾU BÍ! Phe ' + winner + ' Thắng!' + eloMsg;
        statusElement.style.color = '#ff4757'; 
    } 
    else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
        statusText = 'VÁN ĐẤU HÒA! (Không đổi Elo)';
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