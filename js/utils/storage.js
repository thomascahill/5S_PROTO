export function saveColorToStorage(letter, blockNumber, color) {
    const currentMonth = window.currentMonth || 'Jan'; // Fallback to Jan if not set
    const key = `${letter}-${blockNumber}-${currentMonth}`;
    
    localStorage.setItem(key, color);
    console.log('Storage Save:', {
        key,
        letter,
        blockNumber,
        month: currentMonth,
        color
    });

    // Verification log
    const savedValue = localStorage.getItem(key);
    console.log('Storage Save Verification:', {
        key,
        savedValue,
        month: currentMonth,
        success: savedValue === color
    });
}

export function getColorFromStorage(letter, blockNumber) {
    const currentMonth = window.currentMonth || 'Jan'; // Fallback to Jan if not set
    const key = `${letter}-${blockNumber}-${currentMonth}`;
    
    const value = localStorage.getItem(key);
    console.log('Storage Get:', {
        key,
        letter,
        blockNumber,
        month: currentMonth,
        value
    });
    
    return value;
}

export function clearColorStorage() {
    console.log('Clearing color storage');
    const beforeKeys = Object.keys(localStorage).filter(key => key.match(/^[CPQRS]-\d+$/));
    console.log('Keys before clearing:', beforeKeys);
    
    Object.keys(localStorage).forEach(key => {
        if (key.match(/^[CPQRS]-\d+$/)) {
            localStorage.removeItem(key);
        }
    });
    
    const afterKeys = Object.keys(localStorage).filter(key => key.match(/^[CPQRS]-\d+$/));
    console.log('Keys after clearing:', afterKeys);
} 