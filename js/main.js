import { COLORS, DEFAULT_BLOCK_COLOR } from './config/constants.js';
import { saveColorToStorage, getColorFromStorage, clearColorStorage } from './utils/storage.js';
import { createC } from './letters/letterC.js';
import { createP } from './letters/letterP.js';
import { createQ } from './letters/letterQ.js';
import { createR } from './letters/letterR.js';
import { createS } from './letters/letterS.js';

// Export currentColor to make it accessible to letter modules
export let currentColor = COLORS.GREEN;

// Add current month as a global variable
window.currentMonth = 'Jan'; // Make it accessible globally

// Update the existing storage key format in the existing functions
function getStorageKey(letter, blockNumber) {
    return `${letter}-${blockNumber}-${window.currentMonth}`;
}

// Update the existing debugStorage function
function debugStorage(letter, blockNumber, color, operation) {
    console.log(`Storage Debug - ${operation}:`, {
        letter,
        blockNumber,
        month: window.currentMonth,
        color,
        key: getStorageKey(letter, blockNumber),
        existingValue: localStorage.getItem(getStorageKey(letter, blockNumber))
    });
}

// Expose setColor to window for button clicks
window.setColor = function(color) {
    currentColor = color;
    
    // Update active state of all buttons
    document.querySelectorAll('.color-button, .uncheck-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate the selected color button
    document.querySelector(`.color-button[data-color="${color}"]`).classList.add('active');
};

window.setUncheck = function() {
    currentColor = DEFAULT_BLOCK_COLOR;
    
    // Remove active state from all buttons
    document.querySelectorAll('.color-button, .uncheck-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate the uncheck button
    document.querySelector('.uncheck-button').classList.add('active');
};

// Expose resetColors to window for reset button
window.resetColors = function() {
    const currentLetter = document.querySelector('.nav-button.active')?.textContent[0];
    if (currentLetter) {
        document.querySelectorAll('.block').forEach((block, index) => {
            block.style.fill = DEFAULT_BLOCK_COLOR;
            const numberText = block.nextElementSibling;
            if (numberText && numberText.classList.contains('block-number')) {
                const number = numberText.textContent;
                saveColorToStorage(currentLetter, number, DEFAULT_BLOCK_COLOR);
            }
        });
        // Update ratio immediately after reset
        requestAnimationFrame(updateColorRatio);
    }
};

// Add new month selection handling
function setActiveMonth(monthAbbr) {
    window.currentMonth = monthAbbr; // Update global month
    
    document.querySelectorAll('.month-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedButton = document.querySelector(`.month-button[data-month="${monthAbbr}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }

    // Refresh current letter display
    const currentLetter = document.querySelector('.nav-button.active')?.textContent[0];
    if (currentLetter) {
        showLetter(currentLetter);
    }

    console.log(`Switched to month: ${monthAbbr}`);
}

// Update month buttons in HTML and their click handlers
const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Update the HTML structure for month buttons
document.getElementById('month-menu').innerHTML = monthAbbreviations
    .map(month => `
        <button class="month-button" data-month="${month}">${month}</button>
    `).join('');

// Update the existing window.onload function
const originalOnload = window.onload || function() {};
window.onload = function() {
    originalOnload();
    setActiveMonth('Jan');
    setColor('#008000'); // Set initial color
    showLetter('C'); // Show initial letter
};

// Add month button click handlers
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.month-button').forEach(button => {
        button.addEventListener('click', function() {
            const month = this.getAttribute('data-month');
            setActiveMonth(month);
        });
    });
});

// Update showLetter function to handle month-specific colors
window.showLetter = function(letter) {
    console.log('Showing letter:', letter, 'for month:', window.currentMonth);
    
    // Update navigation buttons
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.startsWith(letter)) {
            btn.classList.add('active');
        }
    });

    // Update letter containers
    document.querySelectorAll('.letter-container').forEach(container => {
        container.classList.remove('active');
    });

    const selectedContainer = document.getElementById(`${letter}-container`);
    if (selectedContainer) {
        selectedContainer.classList.add('active');
        const svg = selectedContainer.querySelector('svg');
        svg.innerHTML = '';

        // Create the letter
        switch(letter) {
            case 'C': createC(svg, letter); break;
            case 'P': createP(svg, letter); break;
            case 'Q': createQ(svg, letter); break;
            case 'R': createR(svg, letter); break;
            case 'S': createS(svg, letter); break;
        }

        // Update the debug logging to show month-specific keys
        console.log('Current localStorage state:', {
            letter,
            month: window.currentMonth,
            colors: Object.entries(localStorage)
                .filter(([key]) => key.startsWith(`${letter}-`) && key.endsWith(`-${window.currentMonth}`))
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        });

        // Restore saved colors
        const blocks = svg.querySelectorAll('.block');
        blocks.forEach((block, index) => {
            let numberText = block.nextElementSibling;
            while (numberText && !numberText.classList.contains('block-number')) {
                numberText = numberText.nextElementSibling;
            }
            
            if (numberText && numberText.classList.contains('block-number')) {
                const number = numberText.textContent;
                const savedColor = getColorFromStorage(letter, number);
                if (savedColor) {
                    block.style.fill = savedColor;
                }
            }
        });

        updateColorRatio();
    }
};

// Add function to calculate color ratio
function calculateColorRatio() {
    const currentLetter = document.querySelector('.nav-button.active')?.textContent[0];
    if (!currentLetter) return '0%';

    // Get all blocks for current letter and month
    const currentKeys = Object.entries(localStorage)
        .filter(([key]) => key.startsWith(`${currentLetter}-`) && key.endsWith(`-${window.currentMonth}`));

    // Count colors
    const colorCounts = currentKeys.reduce((acc, [_, value]) => {
        if (value === '#008000') acc.green++; // Green
        if (value === '#ff0000') acc.red++; // Red
        return acc;
    }, { green: 0, red: 0 });

    // Calculate ratio
    const total = colorCounts.green + colorCounts.red;
    if (total === 0) return '0%';
    const ratio = (colorCounts.green / total) * 100;
    return `${Math.round(ratio)}%`;
}

// Function to update the display
function updateColorRatio() {
    const ratio = calculateColorRatio();
    const ratioElement = document.getElementById('color-ratio');
    if (ratioElement) {
        ratioElement.textContent = ratio;
        
        // Add color feedback with transition
        const ratioValue = parseInt(ratio);
        ratioElement.style.transition = 'color 0.3s ease';
        if (ratioValue >= 70) {
            ratioElement.style.color = '#4CAF50'; // Good
        } else if (ratioValue >= 40) {
            ratioElement.style.color = '#FFC107'; // Warning
        } else {
            ratioElement.style.color = '#F44336'; // Poor
        }
    }
}

// Update block creation logic in each letter module to handle uncheck mode
function createBlockClickHandler(block, letter, number) {
    return function() {
        // Apply the color
        this.style.fill = currentColor;
        saveColorToStorage(letter, number, currentColor);
        
        // Immediately update the ratio
        requestAnimationFrame(updateColorRatio); // Use requestAnimationFrame for smooth updates
    };
} 