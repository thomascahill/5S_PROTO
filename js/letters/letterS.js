import { BLOCK_WIDTH } from '../config/constants.js';
import { createBlock, createBlockNumber, calculateNormal } from '../utils/svgHelpers.js';
import { saveColorToStorage } from '../utils/storage.js';
import { currentColor } from '../main.js';

export function createS(svg, letter) {
    const rotationDegrees = 16;
    const stretchFactor = 1.25;
    const blockWidth = BLOCK_WIDTH;
    const totalBlocks = 31;

    // Define control points for the S curve
    const originalControlPoints = [
        { x: 270, y: 600 },
        { x: 370, y: 600 },
        { x: 420, y: 570 },
        { x: 420, y: 500 },
        { x: 380, y: 460 },
        { x: 300, y: 440 },
        { x: 220, y: 420 },
        { x: 180, y: 380 },
        { x: 180, y: 300 },
        { x: 230, y: 270 },
        { x: 330, y: 270 }
    ];

    // Transform control points
    const centerX = 300;
    const centerY = 435;
    const angle = rotationDegrees * Math.PI / 180;

    const transformedPoints = originalControlPoints
        .map(point => ({
            x: centerX + (point.x - centerX) * stretchFactor,
            y: centerY + (point.y - centerY) * stretchFactor
        }))
        .map(point => {
            const translatedX = point.x - centerX;
            const translatedY = point.y - centerY;
            return {
                x: centerX + (translatedX * Math.cos(angle) - translatedY * Math.sin(angle)),
                y: centerY + (translatedX * Math.sin(angle) + translatedY * Math.cos(angle))
            };
        });

    // Generate curve points
    const curvePoints = generateCurvePoints(transformedPoints, 800);
    const distances = calculateDistances(curvePoints);
    const totalDistance = distances[distances.length - 1];

    // Create blocks
    for (let i = 0; i < totalBlocks; i++) {
        const { pathData, midPoint, angle } = createBlockPathData(
            i, totalBlocks, curvePoints, distances, totalDistance, blockWidth
        );

        const block = createBlock(pathData, function() {
            this.style.fill = currentColor;
            saveColorToStorage(letter, i + 1, currentColor);
        });
        svg.appendChild(block);

        const adjustedAngle = angle > 90 || angle < -90 ? angle + 180 : angle;
        const blockNumber = createBlockNumber(
            midPoint.x,
            midPoint.y,
            i + 1,
            adjustedAngle
        );
        svg.appendChild(blockNumber);
    }
}

function generateCurvePoints(points, resolution) {
    const curvePoints = [];
    for (let i = 0; i <= resolution; i++) {
        const t = i / resolution;
        curvePoints.push(getBezierPoint(points, t));
    }
    return curvePoints;
}

function getBezierPoint(points, t) {
    const n = points.length - 1;
    let x = 0, y = 0;
    for (let i = 0; i <= n; i++) {
        const b = bernstein(n, i, t);
        x += points[i].x * b;
        y += points[i].y * b;
    }
    return { x, y };
}

function bernstein(n, i, t) {
    return binomial(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
}

function binomial(n, i) {
    let coeff = 1;
    for (let j = 0; j < i; j++) {
        coeff *= (n - j) / (j + 1);
    }
    return coeff;
}

function calculateDistances(points) {
    const distances = [0];
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        distances.push(distances[i-1] + Math.hypot(dx, dy));
    }
    return distances;
}

function createBlockPathData(blockIndex, totalBlocks, curvePoints, distances, totalDistance, blockWidth) {
    const targetDistance1 = (blockIndex / totalBlocks) * totalDistance;
    const targetDistance2 = ((blockIndex + 1) / totalBlocks) * totalDistance;

    const idx1 = distances.findIndex(d => d >= targetDistance1);
    const idx2 = distances.findIndex(d => d >= targetDistance2);

    const p1 = curvePoints[idx1];
    const p2 = curvePoints[idx2];

    // Calculate tangents
    const tangent1 = calculateTangent(curvePoints, idx1);
    const tangent2 = calculateTangent(curvePoints, idx2);

    // Calculate normals
    const normal1 = calculateNormal(tangent1.x, tangent1.y);
    const normal2 = calculateNormal(tangent2.x, tangent2.y);

    // Create block points
    const points = [
        [p1.x + normal1.x * blockWidth, p1.y + normal1.y * blockWidth],
        [p1.x - normal1.x * blockWidth, p1.y - normal1.y * blockWidth],
        [p2.x - normal2.x * blockWidth, p2.y - normal2.y * blockWidth],
        [p2.x + normal2.x * blockWidth, p2.y + normal2.y * blockWidth]
    ];

    const pathData = points.map((pt, idx) => 
        (idx === 0 ? "M" : "L") + pt[0] + "," + pt[1]
    ).join(" ") + " Z";

    const midPoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };

    const avgTangentX = (tangent1.x + tangent2.x) / 2;
    const avgTangentY = (tangent1.y + tangent2.y) / 2;
    const angle = Math.atan2(avgTangentY, avgTangentX) * 180 / Math.PI;

    return { pathData, midPoint, angle };
}

function calculateTangent(points, index) {
    const prev = points[Math.max(index - 1, 0)];
    const next = points[Math.min(index + 1, points.length - 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy);
    return {
        x: dx / len,
        y: dy / len
    };
} 