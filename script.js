// GAME CONFIGURATION
// Place your image name here
const IMAGE_URL = 'Dia_6.jpeg'; 

const ROWS = 3;
const COLS = 3;
const PIECE_SIZE = 100; // 100px per piece

const boardElement = document.getElementById('puzzle-board');
const piecesContainer = document.getElementById('pieces-container');
const progressText = document.getElementById('progress-text');
const successPanel = document.getElementById('success-panel');
const downloadBtn = document.getElementById('download-btn');

let piecesArray = [];
let selectedPiece = null;

// INITIALIZATION
function initGame() {
    downloadBtn.href = IMAGE_URL;
    downloadBtn.download = 'evidencia_secreta_dia6.jpg';

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const currentId = r * COLS + c;
            
            // Create Slot
            const slotElement = document.createElement('div');
            slotElement.classList.add('slot');
            slotElement.dataset.id = currentId;
            slotElement.innerText = `SEC-${currentId + 1}`;
            slotElement.addEventListener('click', handleSlotClick);
            boardElement.appendChild(slotElement);
            
            // Create Piece
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece');
            pieceElement.dataset.id = currentId;
            pieceElement.style.backgroundImage = `url(${IMAGE_URL})`;
            pieceElement.style.backgroundPosition = `-${c * PIECE_SIZE}px -${r * PIECE_SIZE}px`;
            pieceElement.addEventListener('click', handlePieceClick);
            
            piecesArray.push(pieceElement);
        }
    }

    // Shuffle pieces
    piecesArray.sort(() => Math.random() - 0.5);
    piecesArray.forEach(p => piecesContainer.appendChild(p));

    // Allow returning pieces to the main container
    piecesContainer.addEventListener('click', (e) => {
        if (selectedPiece && e.target === piecesContainer) {
            piecesContainer.appendChild(selectedPiece);
            deselectPiece();
            checkWinCondition();
        }
    });
}

// SELECTION AND MOVEMENT LOGIC
function handlePieceClick(e) {
    e.stopPropagation(); 
    
    const clickedPiece = e.target;

    // Deselect if clicking the same piece
    if (selectedPiece === clickedPiece) {
        deselectPiece();
        return;
    }

    // Swap if another piece is already selected
    if (selectedPiece) {
        const tempParent = clickedPiece.parentElement;
        const selectedParent = selectedPiece.parentElement;
        
        tempParent.appendChild(selectedPiece);
        selectedParent.appendChild(clickedPiece);
        
        deselectPiece();
        checkWinCondition();
        return;
    }

    // Select new piece
    selectedPiece = clickedPiece;
    selectedPiece.classList.add('selected');
}

function handleSlotClick(e) {
    const targetSlot = e.currentTarget;
    
    if (selectedPiece) {
        if (targetSlot.children.length === 0) {
            targetSlot.appendChild(selectedPiece);
            deselectPiece();
            checkWinCondition();
        }
    }
}

function deselectPiece() {
    if (selectedPiece) {
        selectedPiece.classList.remove('selected');
        selectedPiece = null;
    }
}

// WIN CONDITION CHECK
function checkWinCondition() {
    let correctCount = 0;
    const allSlots = document.querySelectorAll('.slot');
    
    allSlots.forEach(slot => {
        const innerPiece = slot.firstElementChild;
        if (innerPiece && innerPiece.dataset.id === slot.dataset.id) {
            correctCount++;
        }
    });
    
    progressText.innerText = `[ ${correctCount}/9 ]`;

    if (correctCount === 9) {
        successPanel.style.display = 'block';
        // Block further clicks
        document.querySelectorAll('.piece').forEach(p => p.style.pointerEvents = 'none');
    } else {
        successPanel.style.display = 'none';
    }
}

// Start game
initGame();
