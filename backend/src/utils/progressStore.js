const progressStore = new Map();

/**
 * Update progress for a specific job ID
 * @param {string} id - The unique ID of the job
 * @param {number} percent - Progress percentage (0-100)
 * @param {string} status - Human readable status message
 */
export const updateProgress = (id, percent, status) => {
    progressStore.set(id, { percent, status, lastUpdate: Date.now() });
};

/**
 * Get progress for a job ID
 * @param {string} id 
 * @returns {object|null}
 */
export const getProgress = (id) => {
    return progressStore.get(id);
};

/**
 * Clear progress (should be called after job completion or expiration)
 * @param {string} id 
 */
export const clearProgress = (id) => {
    progressStore.delete(id);
};

// Cleanup old progress entries every hour
setInterval(() => {
    const now = Date.now();
    for (const [id, value] of progressStore.entries()) {
        if (now - value.lastUpdate > 3600000) { // 1 hour
            progressStore.delete(id);
        }
    }
}, 3600000);
