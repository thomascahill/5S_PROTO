// Shared state
export const state = {
    currentColor: '#008000',
    currentLetter: 'C',
    currentMonth: 'Jan',
    DEFAULT_BLOCK_COLOR: '#808080'
};

// State modification functions
export function setCurrentColor(color) {
    state.currentColor = color;
}

export function setCurrentLetter(letter) {
    state.currentLetter = letter;
}

export function setCurrentMonth(month) {
    state.currentMonth = month;
} 