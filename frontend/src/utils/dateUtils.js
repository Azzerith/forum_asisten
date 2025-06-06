let mockDate = null;

export function setMockDate(dateString) {
    mockDate = new Date(dateString);
}

export function clearMockDate() {
    mockDate = null;
}

export function getCurrentDate() {
    return mockDate || new Date();
}