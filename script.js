// ==========================================
// CONFIGURACIÓN: PON AQUÍ TU IMAGEN
// ¡Cuidado! Distingue entre .jpg y .jpeg
// ==========================================
const IMAGE_URL = 'imagen.jpeg'; 

// Configuración 24 piezas (6 columnas x 4 filas)
const COLS = 6;
const ROWS = 4;
const BOARD_W = 600; 
const BOARD_H = 400; 
const PIECE_W = BOARD_W / COLS; // 100px
const PIECE_H = BOARD_H / ROWS; // 100px

const boardElement = document.getElementById('puzzle-board');
const piecesContainer = document.getElementById('pieces-container');
const progressText = document.getElementById('progress-text');
const successPanel = document.getElementById('success-panel');

let piecesArray = [];
let selectedPiece = null;

// Cargar imagen primero para asegurar que existe y dar error si no
const preloader = new Image();
preloader.src = IMAGE_URL;

preloader.onload = () => {
    initGame();
};

preloader.onerror = () => {
    boardElement.style.display = 'block';
    boardElement.innerHTML = `
        <div style="color:#d32f2f; padding:30px; text-align:center; font-size:1.1rem;">
            <b>[ ERRO CRÍTICO DE SISTEMA ]</b><br><br>
            Non se atopou a evidencia visual: <i>${IMAGE_URL}</i><br><br>
            Asegúrate de que o arquivo está subido e que o nome está EXACTAMENTE igual (respecta as maiúsculas e o .jpg ou .jpeg).
        </div>`;
};

// Generador de formas de puzzle reales (tabs)
function getJigsawPath(w, h, top, right, bottom, left) {
    let d = `M 0 0 `;
    // Arriba
    if (top === 0) d += `h ${w} `;
    else d += `h ${w*0.3} c 0 ${-h*0.2*top}, ${w*0.4} ${-h*0.2*top}, ${w*0.4} 0 h ${w*0.3} `;
    // Derecha
    if (right === 0) d += `v ${h} `;
    else d += `v ${h*0.3} c ${w*0.2*right} 0, ${w*0.2*right} ${h*0.4}, 0 ${h*0.4} v ${h*0.3} `;
    // Abajo
    if (bottom === 0) d += `h ${-w} `;
    else d += `h ${-w*0.3} c 0 ${h*0.2*bottom}, ${-w*0.4} ${h*0.2*bottom}, ${-w*0.4} 0 h ${-w*0.3} `;
    // Izquierda
    if (left === 0) d += `v ${-h} `;
    else d += `v ${-h*0.3} c ${-w*0.2*left} 0, ${-w*0.2*left} ${-h*0.4}, 0 ${-h*0.4} v ${-h*0.3} `;
    return d + ' Z';
}

function initGame() {
    document.getElementById('download-btn').href = IMAGE_URL;
    document.getElementById('download-btn').download = 'evidencia_gc_recuperada.jpg';

    // Generar conexiones lógicas para que encajen matemáticamente
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

    // Crear piezas SVG
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const currentId = r + '-' + c;
            
            // Hueco en el tablero
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.dataset.id = currentId;
            slot.innerText = `SEC-${(r*COLS)+c+1}`;
            slot.addEventListener('click', handleSlotClick);
            boardElement.appendChild(slot);
            
            // Generar pieza con forma irregular
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
            image.setAttribute("width", BOARD_W);
            image.setAttribute("height", BOARD_H);
            // Coordenadas corregidas para que el fondo se alinee perfectamente con el recorte del SVG
            image.setAttribute("x", padX - (c * PIECE_W));
            image.setAttribute("y", padY - (r * PIECE_H));
            image.setAttribute("clip-path", `url(#clip-${currentId})`);
            svg.appendChild(image);

            // Borde táctico de la pieza
            const outline = document.createElementNS(svgNS, "path");
            outline.setAttribute("d", pathData);
            outline.setAttribute("fill", "none");
            outline.setAttribute("stroke", "#f1c40f");
            outline.setAttribute("stroke-width", "1");
            outline.setAttribute("opacity", "0.5");
            svg.appendChild(outline);

            // Contenedor interactivo
            const wrapper = document.createElement('div');
            wrapper.className = 'piece-wrapper';
            wrapper.dataset.id = currentId;
            wrapper.appendChild(svg);
            wrapper.addEventListener('click', handlePieceClick);
            
            piecesArray.push(wrapper);
        }
    }

    // Desordenar y colocar en el panel izquierdo
    piecesArray.sort(() => Math.random() - 0.5);
    piecesArray.forEach(p => piecesContainer.appendChild(p));

    // Permitir devolver piezas
    piecesContainer.addEventListener('click', (e) => {
        if (selectedPiece && e.target === piecesContainer) {
            piecesContainer.appendChild(selectedPiece);
            deselectPiece();
            checkWinCondition();
        }
    });
}

function handlePieceClick(e) {
    e.stopPropagation(); 
    const clickedPiece = e.currentTarget;

    if (selectedPiece === clickedPiece) {
        deselectPiece();
        return;
    }

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
    const allSlots = document.querySelectorAll('.slot');
    
    allSlots.forEach(slot => {
        const innerPiece = slot.firstElementChild;
        if (innerPiece && innerPiece.dataset.id === slot.dataset.id) {
            correctCount++;
        }
    });
    
    progressText.innerText = `[ ${correctCount}/24 ]`;

    if (correctCount === 24) {
        successPanel.style.display = 'block';
        document.querySelectorAll('.piece-wrapper').forEach(p => p.style.pointerEvents = 'none');
    } else {
        successPanel.style.display = 'none';
    }
}
