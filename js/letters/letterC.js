import { BLOCK_WIDTH } from '../config/constants.js';
import { createBlock, createBlockNumber, calculateNormal } from '../utils/svgHelpers.js';
import { saveColorToStorage } from '../utils/storage.js';
import { currentColor } from '../main.js';
import { DEFAULT_BLOCK_COLOR } from '../config/constants.js';

export function createC(svg, letter) {
    const blockWidth = BLOCK_WIDTH;
    const centerX = 300;
    const centerY = 400;
    const radius = 180;
    const totalArcBlocks = 31;
    const arcStartAngle = Math.PI * 0.15; // Open to the right
    const arcEndAngle = Math.PI * 1.85;   // Open to the right
    const arcBlockWidth = blockWidth * 1.1;
    const arcStepsPerBlock = 8;

    for (let i = 0; i < totalArcBlocks; i++) {
        const blockPointsOuter = [];
        const blockPointsInner = [];
        
        // Generate points for the block path
        for (let j = 0; j <= arcStepsPerBlock; j++) {
            const t = i + j / arcStepsPerBlock;
            const angle = arcStartAngle + (t / totalArcBlocks) * (arcEndAngle - arcStartAngle);
            const px = centerX + radius * Math.cos(angle);
            const py = centerY + radius * Math.sin(angle);

            // Compute tangent for normal
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

        // Create the block path
        const allPoints = blockPointsOuter.concat(blockPointsInner);
        const pathData = allPoints.map((pt, idx) => 
            (idx === 0 ? "M" : "L") + pt[0] + "," + pt[1]
        ).join(" ") + " Z";

        // Create and append the block
        const block = createBlock(pathData, function() {
            if (window.isUncheckMode) {
                this.style.fill = DEFAULT_BLOCK_COLOR;
                saveColorToStorage(letter, i + 1, DEFAULT_BLOCK_COLOR);
            } else {
                this.style.fill = currentColor;
                saveColorToStorage(letter, i + 1, currentColor);
            }
        });
        svg.appendChild(block);

        // Add block number
        const midT = i + 0.5;
        const midAngle = arcStartAngle + (midT / totalArcBlocks) * (arcEndAngle - arcStartAngle);
        const midX = centerX + radius * Math.cos(midAngle);
        const midY = centerY + radius * Math.sin(midAngle);
        
        let textAngle = midAngle * 180 / Math.PI + 90;
        if (textAngle > 90 && textAngle < 270) textAngle += 180;
        
        const blockNumber = createBlockNumber(midX, midY, i + 1, textAngle);
        svg.appendChild(blockNumber);
    }
} 