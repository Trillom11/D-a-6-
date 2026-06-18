// ==========================================
// CONFIGURATION
// ==========================================
const IMAGE_URL = 'imagen.jpg'; // Asegúrate de que el nombre del archivo es exactamente este

let COLS = 6;
let ROWS = 6;
let TOTAL_PIECES = 36;

// Tamaño base para el tablero (mantiene proporción 1080:860)
let BOARD_W = 1080; 
let BOARD_H = 860; 
let PIECE_W = BOARD_W / COLS;
let PIECE_H = BOARD_H / ROWS;

const boardElement = document.getElementById('puzzle-board');
const piecesContainer = document.getElementById('pieces-container');
const progressText = document.getElementById('progress-text');
const successPanel = document.getElementById('success-panel');

let piecesArray = [];
let selectedPiece = null;

// Inicializamos el juego directamente al cargar
window.onload = () => {
    boardElement.style.width = `${BOARD_W + 4}px`;
    boardElement.style.height = `${BOARD_H + 4}px`;
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, ${PIECE_W}px)`;
    boardElement.style.gridTemplateRows = `repeat(${ROWS}, ${PIECE_H}px)`;
    
    // Sin imagen de fondo para que sea sorpresa
    boardElement.style.backgroundImage = 'none';
    boardElement.style.boxShadow = 'none';

    initGame();
};

function getJigsawPath(w, h, top, right, bottom, left) {
    let d = `M 0 0 `;
    if (top === 0) d += `h ${w} `;
    else d += `h ${w*0.3} c 0 ${-h*0.2*top}, ${w*0.4} ${-h*0.2*top}, ${w*0.4} 0 h ${w*0.3} `;
    if (right === 0) d += `v ${h} `;
    else d += `v ${h*0.3} c ${w*0.2*right} 0, ${w*0.2*right} ${h*0.4}, 0 ${h*0.4} v ${h*0.3} `;
    if (bottom === 0) d += `h ${-w} `;
    else d += `h ${-w*0.3} c 0 ${h*0.2*bottom}, ${-w*0.4} ${h*0.2*bottom}, ${-w*0.4} 0 h ${-w*0.3} `;
    if (left === 0) d += `v ${-h} `;
    else d += `v ${-h*0.3} c ${-w*0.2*left} 0, ${-w*0.2*left} ${-h*0.4}, 0 ${-h*0.4} v ${-h*0.3} `;
    return d + ' Z';
}

function initGame() {
    document.getElementById('download-btn').href = IMAGE_URL;
    document.getElementById('download-btn').download = 'evidencia_gc_recuperada.jpg';

    const tabs = [];
    for (let r = 0; r < ROWS; r++) {
        tabs[r] = [];
        for (let c = 0; c < COLS; c++) {
            tabs[r][c] = {
                top: r === 0 ? 0 : -tabs[r-1][c].bottom,
                right: c === COLS - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1),
                bottom: r === ROWS - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1),
                left: c === 0 ? 0 : -tabs[r][c-1].right
            };
        }
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const currentId = r + '-' + c;
            
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.dataset.id = currentId;
            slot.innerText = ''; 
            slot.style.width = `${PIECE_W}px`;
            slot.style.height = `${PIECE_H}px`;
            slot.addEventListener('click', handleSlotClick);
            boardElement.appendChild(slot);
            
            const tab = tabs[r][c];
            const pathData = getJigsawPath(PIECE_W, PIECE_H, tab.top, tab.right, tab.bottom, tab.left);
            const padX = PIECE_W * 0.3;
            const padY = PIECE_H * 0.3;

            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("viewBox", `-${padX} -${padY} ${PIECE_W + padX*2} ${PIECE_H + padY*2}`);
            svg.setAttribute("width", PIECE_W + padX*2);
            svg.setAttribute("height", PIECE_H + padY*2);
            svg.style.position = 'absolute';
            svg.style.top = `-${padY}px`;
            svg.style.left = `-${padX}px`;

            const defs = document.createElementNS(svgNS, "defs");
            const clipPath = document.createElementNS(svgNS, "clipPath");
            clipPath.setAttribute("id", `clip-${currentId}`);
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathData);
            clipPath.appendChild(path);
            defs.appendChild(clipPath);
            svg.appendChild(defs);

            const image = document.createElementNS(svgNS, "image");
            image.setAttribute("href", IMAGE_URL);
            // Forzamos a que la imagen llene el tablero exacto
            image.setAttribute("width", BOARD_W);
            image.setAttribute("height", BOARD_H);
            image.setAttribute("x", -(c * PIECE_W));
            image.setAttribute("y", -(r * PIECE_H));
            // 'none' evita que mantenga el aspecto original y lo estira a lo que le digamos
            image.setAttribute("preserveAspectRatio", "none"); 
            image.setAttribute("clip-path", `url(#clip-${currentId})`);
            svg.appendChild(image);

            const outline = document.createElementNS(svgNS, "path");
            outline.setAttribute("d", pathData);
            outline.setAttribute("fill", "none");
            outline.setAttribute("stroke", "#f1c40f");
            outline.setAttribute("stroke-width", "1");
            outline.setAttribute("opacity", "0.5");
            svg.appendChild(outline);

            const wrapper = document.createElement('div');
            wrapper.className = 'piece-wrapper';
            wrapper.dataset.id = currentId;
            wrapper.style.width = `${PIECE_W}px`;
            wrapper.style.height = `${PIECE_H}px`;
            wrapper.appendChild(svg);
            wrapper.addEventListener('click', handlePieceClick);
            
            piecesArray.push(wrapper);
        }
    }

    piecesArray.sort(() => Math.random() - 0.5);
    piecesArray.forEach(p => piecesContainer.appendChild(p));
}

function handlePieceClick(e) {
    e.stopPropagation(); 
    const clickedPiece = e.currentTarget;
    if (selectedPiece === clickedPiece) { deselectPiece(); return; }
    if (selectedPiece) {
        const tempParent = clickedPiece.parentElement;
        const selectedParent = selectedPiece.parentElement;
        tempParent.appendChild(selectedPiece);
        selectedParent.appendChild(clickedPiece);
        deselectPiece();
        checkWinCondition();
        return;
    }
    selectedPiece = clickedPiece;
    selectedPiece.classList.add('selected');
}

function handleSlotClick(e) {
    const targetSlot = e.currentTarget;
    if (selectedPiece && targetSlot.children.length === 0) {
        targetSlot.appendChild(selectedPiece);
        deselectPiece();
        checkWinCondition();
    }
}

function deselectPiece() {
    if (selectedPiece) {
        selectedPiece.classList.remove('selected');
        selectedPiece = null;
    }
}

function checkWinCondition() {
    let correctCount = 0;
    document.querySelectorAll('.slot').forEach(slot => {
        const innerPiece = slot.firstElementChild;
        if (innerPiece && innerPiece.dataset.id === slot.dataset.id) correctCount++;
    });
    progressText.innerText = `[ ${correctCount}/${TOTAL_PIECES} ]`;
    if (correctCount === TOTAL_PIECES) {
        successPanel.style.display = 'block';
        document.querySelectorAll('.piece-wrapper').forEach(p => p.style.pointerEvents = 'none');
    }
}
