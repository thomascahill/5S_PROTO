export function createSvgElement(type, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", type);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
}

export function createBlock(pathData, onClick) {
    const block = createSvgElement("path", {
        d: pathData,
        class: "block"
    });
    if (onClick) {
        block.onclick = onClick;
    }
    return block;
}

export function createBlockNumber(x, y, number, rotation = 0, rotationOrigin = null) {
    const text = createSvgElement("text", {
        x: x.toString(),
        y: y.toString(),
        class: "block-number"
    });
    
    if (rotation !== 0) {
        const origin = rotationOrigin || `${x},${y}`;
        text.setAttribute("transform", `rotate(${rotation}, ${origin})`);
    }
    
    text.textContent = number.toString();
    return text;
}

export function calculateNormal(dx, dy) {
    const len = Math.sqrt(dx * dx + dy * dy);
    return {
        x: -dy / len,
        y: dx / len
    };
} 