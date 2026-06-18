// ==========================================
// CONFIGURATION
// ==========================================
const IMAGE_URL = 'imagen.jpg'; 
let COLS = 6;
let ROWS = 6;
let TOTAL_PIECES = 36;

// Formato deseado: 1080x860
let BOARD_W = 1080 / 2; // Reducido a la mitad para que no sea gigante
let BOARD_H = 860 / 2;
let PIECE_W = BOARD_W / COLS;
let PIECE_H = BOARD_H / ROWS;

// Variables de recorte para centrar
let cropX, cropY, cropW, cropH;

const boardElement = document.getElementById('puzzle-board');
const piecesContainer = document.getElementById('pieces-container');
const progressText = document.getElementById('progress-text');
const successPanel = document.getElementById('success-panel');

let piecesArray = [];
let selectedPiece = null;

const preloader = new Image();

preloader.onload = () => {
    const imgW = preloader.naturalWidth;
    const imgH = preloader.naturalHeight;
    const targetRatio = 1080 / 860;
    const imgRatio = imgW / imgH;

    // Calcular el recorte centrado
    if (imgRatio > targetRatio) {
        cropH = imgH;
        cropW = imgH * targetRatio;
        cropX = (imgW - cropW) / 2;
        cropY = 0;
    } else {
        cropW = imgW;
        cropH = imgW / targetRatio;
        cropX = 0;
        cropY = (imgH - cropH) / 2;
    }

    boardElement.style.width = `${BOARD_W + 4}px`;
    boardElement.style.height = `${BOARD_H + 4}px`;
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, ${PIECE_W}px)`;
    boardElement.style.gridTemplateRows = `repeat(${ROWS}, ${PIECE_H}px)`;
    
    initGame();
};

preloader.src = IMAGE_URL;

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
            // El truco está aquí: ajustamos x e y para mostrar solo el trozo centrado
            image.setAttribute("width", BOARD_W * (preloader.naturalWidth / cropW));
            image.setAttribute("height", BOARD_H * (preloader.naturalHeight / cropH));
            image.setAttribute("x", -(c * PIECE_W) - (cropX * (BOARD_W / cropW)));
            image.setAttribute("y", -(r * PIECE_H) - (cropY * (BOARD_H / cropH)));
            
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

// ... (Funciones handlePieceClick, handleSlotClick, deselectPiece, checkWinCondition igual)
