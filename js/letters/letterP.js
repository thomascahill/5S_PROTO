import { BLOCK_WIDTH } from '../config/constants.js';
import { createBlock, createBlockNumber, calculateNormal } from '../utils/svgHelpers.js';
import { saveColorToStorage } from '../utils/storage.js';
import { currentColor } from '../main.js';

export function createP(svg, letter) {
    createStemBlocks(svg, letter);
    createArcBlocks(svg, letter);
}

function createStemBlocks(svg, letter) {
    const blockWidth = BLOCK_WIDTH;
    const stemX = 200;
    const stemStartY = 700;
    const stemEndY = 200;
    const stemHeight = stemStartY - stemEndY;
    const blockHeight = stemHeight / 16;

    for (let i = 0; i < 16; i++) {
        const y1 = stemStartY - (i * blockHeight);
        const y2 = y1 - blockHeight;

        const pathData = `
            M${stemX - blockWidth},${y1}
            L${stemX + blockWidth},${y1}
            L${stemX + blockWidth},${y2}
            L${stemX - blockWidth},${y2}
            Z
        `;

        const block = createBlock(pathData, function() {
            this.style.fill = currentColor;
            saveColorToStorage(letter, i + 1, currentColor);
        });
        svg.appendChild(block);

        const blockNumber = createBlockNumber(stemX, (y1 + y2) / 2, i + 1);
        svg.appendChild(blockNumber);
    }
}

function createArcBlocks(svg, letter) {
    const blockWidth = BLOCK_WIDTH;
    const centerX = 200 + 35;
    const centerY = 200 + 138;
    const radius = 100;
    const totalArcBlocks = 15;
    const arcStartAngle = -Math.PI * 0.5;
    const arcEndAngle = Math.PI * 0.5;
    const arcBlockWidth = blockWidth * 1.1;
    const arcStepsPerBlock = 8;

    for (let i = 0; i < totalArcBlocks; i++) {
        const blockPointsOuter = [];
        const blockPointsInner = [];

        for (let j = 0; j <= arcStepsPerBlock; j++) {
            const t = i + j / arcStepsPerBlock;
            const angle = arcStartAngle + (t / totalArcBlocks) * (arcEndAngle - arcStartAngle);
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
            this.style.fill = currentColor;
            saveColorToStorage(letter, i + 17, currentColor);
        });
        svg.appendChild(block);

        const midT = i + 0.5;
        const midAngle = arcStartAngle + (midT / totalArcBlocks) * (arcEndAngle - arcStartAngle);
        const midX = centerX + radius * Math.cos(midAngle);
        const midY = centerY + radius * Math.sin(midAngle);
        
        let textAngle = midAngle * 180 / Math.PI + 90;
        if (textAngle > 90 && textAngle < 270) textAngle += 180;
        
        const blockNumber = createBlockNumber(midX, midY, i + 17, textAngle);
        svg.appendChild(blockNumber);
    }
} 