import { BLOCK_WIDTH } from '../config/constants.js';
import { createBlock, createBlockNumber, calculateNormal } from '../utils/svgHelpers.js';
import { saveColorToStorage } from '../utils/storage.js';
import { currentColor } from '../main.js';

// Add a debug function
function debugStorage(letter, blockNumber, color, operation) {
    console.log(`R Debug - ${operation}:`, {
        letter,
        blockNumber,
        color,
        key: `${letter}-${blockNumber}`,
        stackTrace: new Error().stack
    });
}

export function createR(svg, letter) {
    console.log('Creating letter R with letter param:', letter);
    createStemBlocks(svg, letter);
    createArcBlocks(svg, letter);
    createLegBlocks(svg, letter);
}

function createStemBlocks(svg, letter) {
    const stemX = 200;
    const stemStartY = 700;
    const stemEndY = 200;
    const stemHeight = stemStartY - stemEndY;
    const blockHeight = stemHeight / 14;

    for (let i = 0; i < 14; i++) {
        const y1 = stemStartY - (i * blockHeight);
        const y2 = y1 - blockHeight;
        const blockNumber = i + 1;

        const pathData = `
            M${stemX - BLOCK_WIDTH},${y1}
            L${stemX + BLOCK_WIDTH},${y1}
            L${stemX + BLOCK_WIDTH},${y2}
            L${stemX - BLOCK_WIDTH},${y2}
            Z
        `;

        const block = createBlock(pathData, function() {
            debugStorage(letter, blockNumber, currentColor, 'Saving Stem Block');
            this.style.fill = currentColor;
            saveColorToStorage(letter, blockNumber, currentColor);
        });
        svg.appendChild(block);

        const numberText = createBlockNumber(stemX, (y1 + y2) / 2, blockNumber);
        svg.appendChild(numberText);
    }
}

function createArcBlocks(svg, letter) {
    const centerX = 200 + 35;
    const centerY = 200 + 138;
    const radius = 100;
    const totalArcBlocks = 12;
    const arcBlockWidth = BLOCK_WIDTH * 1.1;
    const arcStepsPerBlock = 8;

    for (let i = 0; i < totalArcBlocks; i++) {
        const blockNumber = i + 15;  // Numbers 15-26
        const blockPointsOuter = [];
        const blockPointsInner = [];

        for (let j = 0; j <= arcStepsPerBlock; j++) {
            const t = i + j / arcStepsPerBlock;
            const angle = -Math.PI * 0.5 + (t / totalArcBlocks) * Math.PI;
            const px = centerX + radius * Math.cos(angle);
            const py = centerY + radius * Math.sin(angle);

            const delta = 0.0001;
            const angleTangent = angle + delta;
            const tx = centerX + radius * Math.cos(angleTangent);
            const ty = centerY + radius * Math.sin(angleTangent);
            const dx = tx - px;
            const dy = ty - py;
            const normal = calculateNormal(dx, dy);

            blockPointsOuter.push([px + normal.x * arcBlockWidth, py + normal.y * arcBlockWidth]);
            blockPointsInner.unshift([px - normal.x * arcBlockWidth, py - normal.y * arcBlockWidth]);
        }

        const allPoints = blockPointsOuter.concat(blockPointsInner);
        const pathData = allPoints.map((pt, idx) => 
            (idx === 0 ? "M" : "L") + pt[0] + "," + pt[1]
        ).join(" ") + " Z";

        const block = createBlock(pathData, function() {
            debugStorage(letter, blockNumber, currentColor, 'Saving Arc Block');
            this.style.fill = currentColor;
            saveColorToStorage(letter, blockNumber, currentColor);
        });
        svg.appendChild(block);

        const midT = i + 0.5;
        const midAngle = -Math.PI * 0.5 + (midT / totalArcBlocks) * Math.PI;
        const midX = centerX + radius * Math.cos(midAngle);
        const midY = centerY + radius * Math.sin(midAngle);
        
        let textAngle = midAngle * 180 / Math.PI + 90;
        if (textAngle > 90 && textAngle < 270) textAngle += 180;
        
        const numberText = createBlockNumber(midX, midY, blockNumber, textAngle);
        svg.appendChild(numberText);
    }
}

function createLegBlocks(svg, letter) {
    const centerX = 200 + 35;
    const centerY = 200 + 138;
    const radius = 100;
    const legScale = 0.97;
    const legDx = 100 * legScale;
    const legDy = 230 * legScale;
    const migrateX = 60;
    const migrateY = 25;

    const baseStartX = centerX + radius * Math.cos(Math.PI * 0.5);
    const baseStartY = centerY + radius * Math.sin(Math.PI * 0.5);
    const baseEndX = baseStartX + legDx;
    const baseEndY = baseStartY + legDy;

    const startX = baseStartX + migrateX;
    const startY = baseStartY + migrateY;
    const endX = baseEndX + migrateX;
    const endY = baseEndY + migrateY;

    // Create leg blocks (27-31)
    for (let i = 0; i < 5; i++) {
        const blockNumber = i + 27;
        const t1 = i / 5;
        const t2 = (i + 1) / 5;
        
        const x1 = startX + (endX - startX) * t1;
        const y1 = startY + (endY - startY) * t1;
        const x2 = startX + (endX - startX) * t2;
        const y2 = startY + (endY - startY) * t2;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const normal = calculateNormal(dx, dy);
        const nx = normal.x * BLOCK_WIDTH;
        const ny = normal.y * BLOCK_WIDTH;

        const pathData = `
            M${x1 + nx},${y1 + ny}
            L${x2 + nx},${y2 + ny}
            L${x2 - nx},${y2 - ny}
            L${x1 - nx},${y1 - ny}
            Z
        `;

        const block = createBlock(pathData, function() {
            debugStorage(letter, blockNumber, currentColor, 'Saving Leg Block');
            this.style.fill = currentColor;
            saveColorToStorage(letter, blockNumber, currentColor);
        });
        svg.appendChild(block);

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const adjustedAngle = angle > 90 || angle < -90 ? angle + 180 : angle;
        
        const numberText = createBlockNumber(midX, midY, blockNumber, adjustedAngle);
        svg.appendChild(numberText);
    }
} 