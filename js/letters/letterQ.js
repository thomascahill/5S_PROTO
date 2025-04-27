import { BLOCK_WIDTH } from '../config/constants.js';
import { createBlock, createBlockNumber, calculateNormal } from '../utils/svgHelpers.js';
import { saveColorToStorage } from '../utils/storage.js';
import { currentColor } from '../main.js';

export function createQ(svg, letter) {
    const blockWidth = BLOCK_WIDTH;
    const centerX = 300;
    const centerY = 400;
    const radius = 180;
    const totalCircleBlocks = 29;
    const arcBlockWidth = blockWidth * 1.1;
    const arcStepsPerBlock = 8;

    // Create main circle blocks
    for (let i = 0; i < totalCircleBlocks; i++) {
        const blockPointsOuter = [];
        const blockPointsInner = [];

        for (let j = 0; j <= arcStepsPerBlock; j++) {
            const t = i + j / arcStepsPerBlock;
            const angle = (t / totalCircleBlocks) * (Math.PI * 2);
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

        let number;
        if (i === 3) {
            number = 2;
        } else if (i < 3) {
            number = 2 + (3 - i);
        } else {
            number = 2 + (totalCircleBlocks - (i - 3));
        }
        if (number > 30) number -= totalCircleBlocks;

        const block = createBlock(pathData, function() {
            this.style.fill = currentColor;
            saveColorToStorage(letter, number, currentColor);
        });
        svg.appendChild(block);

        const midT = i + 0.5;
        const midAngle = (midT / totalCircleBlocks) * (Math.PI * 2);
        const midX = centerX + radius * Math.cos(midAngle);
        const midY = centerY + radius * Math.sin(midAngle);
        
        let textAngle = midAngle * 180 / Math.PI + 90;
        if (textAngle > 90 && textAngle < 270) textAngle += 180;

        const blockNumber = createBlockNumber(midX, midY, number, textAngle);
        svg.appendChild(blockNumber);
    }

    createTailBlocks(svg, letter, centerX, centerY, radius, arcBlockWidth);
}

function createTailBlocks(svg, letter, centerX, centerY, radius, arcBlockWidth) {
    const tailAngle = Math.PI * 0.25;
    const tailBlockWidth = BLOCK_WIDTH * 0.7;
    const tailDir = Math.PI * 1.25;

    // Block 1 (outer tail)
    const startX1 = centerX + (radius + arcBlockWidth * 3.0) * Math.cos(tailAngle);
    const startY1 = centerY + (radius + arcBlockWidth * 3.0) * Math.sin(tailAngle);
    const endX1 = startX1 + 75 * Math.cos(tailDir);
    const endY1 = startY1 + 75 * Math.sin(tailDir);

    const block1Data = createTailBlockPath(startX1, startY1, endX1, endY1, tailBlockWidth);
    const block1 = createBlock(block1Data, function() {
        this.style.fill = currentColor;
        saveColorToStorage(letter, 1, currentColor);
    });
    svg.appendChild(block1);

    const midX1 = (startX1 + endX1) / 2;
    const midY1 = (startY1 + endY1) / 2;
    const angle1 = Math.atan2(endY1 - startY1, endX1 - startX1) * 180 / Math.PI + 180;
    const number1 = createBlockNumber(midX1, midY1, 1, angle1);
    svg.appendChild(number1);

    // Block 31 (inner tail)
    const inwardOffset = arcBlockWidth * 1.0;
    const startX2 = centerX + (radius - inwardOffset) * Math.cos(tailAngle);
    const startY2 = centerY + (radius - inwardOffset) * Math.sin(tailAngle);
    const endX2 = startX2 + 70 * Math.cos(tailDir);
    const endY2 = startY2 + 70 * Math.sin(tailDir);

    const block2Data = createTailBlockPath(startX2, startY2, endX2, endY2, tailBlockWidth);
    const block2 = createBlock(block2Data, function() {
        this.style.fill = currentColor;
        saveColorToStorage(letter, 31, currentColor);
    });
    svg.appendChild(block2);

    const midX2 = (startX2 + endX2) / 2;
    const midY2 = (startY2 + endY2) / 2;
    const angle2 = Math.atan2(endY2 - startY2, endX2 - startX2) * 180 / Math.PI + 180;
    const number2 = createBlockNumber(midX2, midY2, 31, angle2);
    svg.appendChild(number2);
}

function createTailBlockPath(startX, startY, endX, endY, width) {
    const dx = endX - startX;
    const dy = endY - startY;
    const normal = calculateNormal(dx, dy);
    const nx = normal.x * width;
    const ny = normal.y * width;

    return `M${startX + nx},${startY + ny} L${endX + nx},${endY + ny} L${endX - nx},${endY - ny} L${startX - nx},${startY - ny} Z`;
} 