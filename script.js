// --- DOM Elements ---
const addTimerForm = document.getElementById("add-timer-form");
const examNameInput = document.getElementById("exam-name");
const examDateInput = document.getElementById("exam-date");
const timersContainer = document.getElementById("timers-container");
const formErrorEl = document.getElementById("form-error");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFileInput = document.getElementById("import-file-input");
const importPreset1Btn = document.getElementById("import-preset-1");
const importPreset2Btn = document.getElementById("import-preset-2");
const removeAllBtn = document.getElementById("remove-all-btn");
const importExportStatusEl = document.getElementById(
    "import-export-status"
);

// NEW: Elements for "Add Individual Paper" card
const paperSubjectSelect = document.getElementById("paper-subject");
const paperCodeSelect = document.getElementById("paper-code");
const paperDateText = document.getElementById("paper-datetime");
const addPaperBtn = document.getElementById("add-paper-btn");
const paperStatusEl = document.getElementById("paper-add-status");

// --- App State ---
let timers = [];

// --- Functions ---

/**
 * Initialize the app by loading timers from localStorage and starting clocks.
 */
function initialize() {
    loadTimers();
    startClocks();
    // Initialize the Individual Paper card (if present in DOM)
    initPaperCard();
}

/**
 * Loads timers from localStorage.
 */
function loadTimers() {
    const stored = localStorage.getItem("examTimers");
    if (stored) {
        timers = JSON.parse(stored);
    }
    renderTimers();
}

/**
 * Saves timers to localStorage.
 */
function saveTimers() {
    localStorage.setItem("examTimers", JSON.stringify(timers));
}

/**
 * Renders the timer cards to the DOM.
 */
function renderTimers() {
    timersContainer.innerHTML = "";
    if (timers.length === 0) {
        timersContainer.innerHTML = `<div class="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
                    <p class="text-xl">No countdowns yet.</p>
                    <p>Add your first exam using the form above!</p>
                 </div>`;
        return;
    }
    // Sort timers by the closest target date first
    timers.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
    timers.forEach((timer, index) => {
        const timerEl = document.createElement("div");
        timerEl.className =
            "timer-card bg-gray-100 dark:bg-gray-800 p-5 py-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 flex flex-col relative";
        timerEl.dataset.index = index;
        timerEl.dataset.targetDate = timer.targetDate;

        timerEl.innerHTML = `
                    <button class="delete-btn absolute top-2 right-2 w-6 h-6 bg-red-300 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition duration-200 opacity-75 hover:opacity-100" title="Delete timer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <div class="flex-grow">
                        <h3 class="text-xl font-bold truncate">${escapeHTML(
            timer.name
        )}</h3>
                        <p class="text-sm text-gray-400 dark:text-gray-400 mb-4">${new Date(
            timer.targetDate
        ).toLocaleString([], {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })}</p>
                        <div class="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <div class="text-3xl font-semibold time-days">00</div>
                                <div class="text-xs text-gray-400 dark:text-gray-400">Days</div>
                            </div>
                            <div>
                                <div class="text-3xl font-semibold time-hours">00</div>
                                <div class="text-xs text-gray-400 dark:text-gray-400">Hours</div>
                            </div>
                            <div>
                                <div class="text-3xl font-semibold time-minutes">00</div>
                                <div class="text-xs text-gray-400 dark:text-gray-400">Mins</div>
                            </div>
                        </div>
                    </div>
                `;
        timersContainer.appendChild(timerEl);
    });
}

/**
 * Updates the countdown display for all timers.
 */
function updateCountdowns() {
    const now = new Date().getTime();
    document.querySelectorAll(".timer-card").forEach((card) => {
        const targetDate = new Date(card.dataset.targetDate).getTime();
        const distance = targetDate - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60)
            );

            card.querySelector(".time-days").textContent = String(
                days
            ).padStart(2, "0");
            card.querySelector(".time-hours").textContent = String(
                hours
            ).padStart(2, "0");
            card.querySelector(".time-minutes").textContent = String(
                minutes
            ).padStart(2, "0");
        } else {
            card.querySelector(".time-days").textContent = "00";
            card.querySelector(".time-hours").textContent = "00";
            card.querySelector(".time-minutes").textContent = "00";
            // Optionally, change style to indicate completion
            if (!card.classList.contains("opacity-50")) {
                card.classList.add("opacity-50", "bg-green-900/50");
                card.querySelector("h3").textContent += " - Time's up!";
            }
        }
    });
}

/**
 * Starts all the intervals for updating clocks.
 */
function startClocks() {
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
}

/**
 * Sanitizes HTML to prevent XSS.
 * @param {string} str The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHTML(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Clears a status message after a delay.
 * @param {HTMLElement} element The HTML element to clear.
 */
function clearStatus(element) {
    setTimeout(() => {
        element.textContent = "";
    }, 3000);
}

/**
 * Imports timers from a JSON string.
 * @param {string} jsonString The JSON string containing timer data.
 * @param {string} presetName The name of the preset for status messages.
 */
function importFromJsonString(jsonString, presetName) {
    try {
        const importedTimers = JSON.parse(jsonString);
        if (!Array.isArray(importedTimers)) {
            throw new Error("JSON is not an array.");
        }

        let newTimersAdded = 0;
        for (const timer of importedTimers) {
            // Basic validation for imported timer object
            if (
                timer.name &&
                timer.targetDate &&
                new Date(timer.targetDate) > new Date()
            ) {
                // Prevent duplicates
                const isDuplicate = timers.some(
                    (existing) =>
                        existing.name === timer.name &&
                        existing.targetDate === timer.targetDate
                );
                if (!isDuplicate) {
                    timers.push({
                        name: timer.name,
                        targetDate: timer.targetDate,
                    });
                    newTimersAdded++;
                }
            }
        }
        if (newTimersAdded > 0) {
            saveTimers();
            renderTimers();
        }

        importExportStatusEl.textContent = `Successfully imported ${newTimersAdded} timers from ${presetName}.`;
        importExportStatusEl.className =
            "text-green-600 dark:text-green-400 mt-3 text-sm h-4";
    } catch (error) {
        console.error("Import error:", error);
        importExportStatusEl.textContent = `Import failed for ${presetName}. Invalid JSON format.`;
        importExportStatusEl.className =
            "text-red-600 dark:text-red-400 mt-3 text-sm h-4";
    } finally {
        clearStatus(importExportStatusEl);
    }
}

// NEW: Paper schedule dataset from provided JSON
const paperSchedule = {
    "Economics": {
        "P12": "2025-11-06T12:30",
        "P22": "2025-09-30T12:30",
        "P32": "2025-11-12T12:30",
        "P42": "2025-10-14T12:30"
    },
    "Business": {
        "P12": "2025-10-06T12:30",
        "P22": "2025-10-09T12:30",
        "P32": "2025-10-13T12:30",
        "P42": "2025-10-21T12:30"
    },
    "Further Mathematics": {
        "P12": "2025-10-08T12:30",
        "P22": "2025-10-24T12:30",
        "P32": "2025-10-10T12:30",
        "P42": "2025-10-31T12:30"
    },
    "Chemistry": {
        "P13": "2025-11-13T08:30",
        "P23": "2025-10-10T08:30",
        "P36": "2025-10-28T08:30",
        "P43": "2025-10-17T08:30",
        "P53": "2025-10-10T10:15"
    },
    "Physics": {
        "P13": "2025-11-12T08:30",
        "P23": "2025-10-15T08:30",
        "P36": "2025-10-23T08:30",
        "P43": "2025-10-13T08:30",
        "P53": "2025-10-15T10:15"
    },
    "Biology": {
        "P13": "2025-11-11T08:30",
        "P23": "2025-10-21T08:30",
        "P36": "2025-10-28T10:30",
        "P43": "2025-10-24T08:30",
        "P53": "2025-10-21T08:30"
    },
    "Accounting": {
        "P12": "2025-11-10T12:30",
        "P22": "2025-10-16T12:30",
        "P32": "2025-10-23T12:30",
        "P42": "2025-10-29T12:30"
    },
    "Psychology": {
        "P12": "2025-10-13T12:30",
        "P22": "2025-10-16T12:30",
        "P32": "2025-10-23T12:30",
        "P42": "2025-11-04T12:30"
    },
    "Mathematics": {
        "P13": "2025-10-08T08:30",
        "P33": "2025-10-22T08:30",
        "P43": "2025-10-14T08:30",
        "P53": "2025-10-14T08:30",
        "P63": "2025-10-14T08:30"
    }
};

// NEW: Helpers for Add Individual Paper card
function initPaperCard() {
    if (!paperSubjectSelect || !paperCodeSelect || !paperDateText || !addPaperBtn) return;

    // Populate subjects
    const subjects = Object.keys(paperSchedule).sort((a, b) => a.localeCompare(b));
    paperSubjectSelect.innerHTML = "";
    for (const s of subjects) {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        paperSubjectSelect.appendChild(opt);
    }

    paperSubjectSelect.addEventListener("change", populatePapersForSelectedSubject);
    paperCodeSelect.addEventListener("change", updateSelectedPaperInfo);
    addPaperBtn.addEventListener("click", onAddSelectedPaper);

    populatePapersForSelectedSubject();
}

function populatePapersForSelectedSubject() {
    const subject = paperSubjectSelect.value;
    paperCodeSelect.innerHTML = "";
    if (!subject || !paperSchedule[subject]) {
        paperCodeSelect.disabled = true;
        paperDateText.textContent = "—";
        return;
    }

    const papers = Object.keys(paperSchedule[subject]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    for (const p of papers) {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        paperCodeSelect.appendChild(opt);
    }
    paperCodeSelect.disabled = papers.length === 0;
    updateSelectedPaperInfo();
}

function updateSelectedPaperInfo() {
    const subject = paperSubjectSelect.value;
    const paper = paperCodeSelect.value;
    if (!subject || !paper) {
        paperDateText.textContent = "—";
        return;
    }
    const iso = paperSchedule[subject][paper];
    if (!iso) {
        paperDateText.textContent = "—";
        return;
    }
    paperDateText.textContent = new Date(iso).toLocaleString([], {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function onAddSelectedPaper() {
    const subject = paperSubjectSelect.value;
    const paper = paperCodeSelect.value;
    if (!subject || !paper) return;

    const targetDate = paperSchedule[subject][paper];
    const name = `${subject} ${paper}`;

    // Validate future date
    if (new Date(targetDate) <= new Date()) {
        paperStatusEl.textContent = "That paper time has already passed.";
        paperStatusEl.className = "text-yellow-400 mt-3 text-sm h-4";
        clearStatus(paperStatusEl);
        return;
    }

    // Prevent duplicates
    const exists = timers.some((t) => t.name === name && t.targetDate === targetDate);
    if (exists) {
        paperStatusEl.textContent = "This paper timer already exists.";
        paperStatusEl.className = "text-yellow-400 mt-3 text-sm h-4";
        clearStatus(paperStatusEl);
        return;
    }

    timers.push({ name, targetDate });
    saveTimers();
    renderTimers();

    paperStatusEl.textContent = "Paper timer added.";
    paperStatusEl.className = "text-green-400 mt-3 text-sm h-4";
    clearStatus(paperStatusEl);
}

// --- Event Listeners ---

/**
 * Handles form submission to add a new timer.
 */
addTimerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = examNameInput.value.trim();
    const targetDate = examDateInput.value;

    // Basic validation
    if (!name || !targetDate) {
        formErrorEl.textContent = "Please fill in all fields.";
        return;
    }
    if (new Date(targetDate) <= new Date()) {
        formErrorEl.textContent = "Please select a future date and time.";
        clearStatus(formErrorEl);
        return;
    }

    formErrorEl.textContent = "";

    timers.push({ name, targetDate });
    saveTimers();
    renderTimers();
    examNameInput.value = "";
    examDateInput.value = "";
});

/**
 * Handles clicks on the delete button for a timer.
 */
timersContainer.addEventListener("click", async (e) => {
    const delBtn = e.target.closest && e.target.closest(".delete-btn");
    if (delBtn) {
        const card = delBtn.closest(".timer-card");
        const index = parseInt(card.dataset.index);
        if (!isNaN(index)) {
            timers.splice(index, 1);
            saveTimers();
            renderTimers();
        }
    }
});

/**
 * Handles exporting timers to a JSON file.
 */
exportBtn.addEventListener("click", () => {
    if (timers.length === 0) {
        importExportStatusEl.textContent = "No timers to export.";
        importExportStatusEl.className = "text-yellow-400 mt-3 text-sm h-4";
        clearStatus(importExportStatusEl);
        return;
    }

    const timersToExport = timers.map(({ name, targetDate }) => ({
        name,
        targetDate,
    }));
    const jsonString = JSON.stringify(timersToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-timers.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    importExportStatusEl.textContent = `Exported ${timers.length} timers successfully.`;
    importExportStatusEl.className = "text-green-400 mt-3 text-sm h-4";
    clearStatus(importExportStatusEl);
});

/**
 * Triggers the hidden file input when the import button is clicked.
 */
importBtn.addEventListener("click", () => {
    importFileInput.click();
});

/**
 * Handles the file selection and initiates the import process.
 */
importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const importedTimers = JSON.parse(event.target.result);
            if (!Array.isArray(importedTimers)) {
                throw new Error("JSON is not an array.");
            }

            let newTimersAdded = 0;
            for (const timer of importedTimers) {
                // Basic validation for imported timer object
                if (
                    timer.name &&
                    timer.targetDate &&
                    new Date(timer.targetDate) > new Date()
                ) {
                    // Prevent duplicates
                    const isDuplicate = timers.some(
                        (existing) =>
                            existing.name === timer.name &&
                            existing.targetDate === timer.targetDate
                    );
                    if (!isDuplicate) {
                        timers.push({
                            name: timer.name,
                            targetDate: timer.targetDate,
                        });
                        newTimersAdded++;
                    }
                }
            }
            if (newTimersAdded > 0) {
                saveTimers();
                renderTimers();
            }

            importExportStatusEl.textContent = `Successfully imported ${newTimersAdded} new timers.`;
            importExportStatusEl.className = "text-green-400 mt-3 text-sm h-4";
        } catch (error) {
            console.error("Import error:", error);
            importExportStatusEl.textContent =
                "Import failed. Invalid JSON file format.";
            importExportStatusEl.className = "text-red-400 mt-3 text-sm h-4";
        } finally {
            // Reset file input to allow importing the same file again
            importFileInput.value = "";
            clearStatus(importExportStatusEl);
        }
    };
    reader.readAsText(file);
});

/**
 * Handles preset 1 import button click.
 */
importPreset1Btn.addEventListener("click", () => {
    // TODO: Replace with actual JSON string for "AS Fmt, Mth, Chm, Phy"
    const presetJson =
        '[{"name": "Math P1", "targetDate": "2025-10-08T08:30"},{"name": "Math P5", "targetDate": "2025-10-16T08:30"},{"name": "Further Maths P1", "targetDate": "2025-10-08T12:30"},{"name": "Further Maths P3", "targetDate": "2025-10-10T12:30"},{"name": "Chem P1", "targetDate": "2025-11-13T08:30"},{"name": "Chem P2", "targetDate": "2025-10-10T08:30"},{"name": "Chem P3", "targetDate": "2025-10-28T08:30"},{"name": "Physics P1", "targetDate": "2025-11-12T08:30"},{"name": "Physics P2", "targetDate": "2025-10-15T08:30"},{"name": "Physics P3", "targetDate": "2025-10-23T08:30"}]';
    importFromJsonString(presetJson, "AS Fmt, Mth, Chm, Phy");
});

/**
 * Handles preset 2 import button click.
 */
importPreset2Btn.addEventListener("click", () => {
    // TODO: Replace with actual JSON string for "AS Mth, Bio, Chm, Phy"
    const presetJson =
        '[{"name": "Biology P1", "targetDate": "2025-11-11T08:30"}, {"name": "Biology P2", "targetDate": "2025-10-21T08:30"}, {"name": "Biology P3", "targetDate": "2025-10-28T10:30"}, {"name": "Math P1", "targetDate": "2025-10-08T08:30"}, {"name": "Math P5", "targetDate": "2025-10-16T08:30"}, {"name": "Chem P1", "targetDate": "2025-11-13T08:30"}, {"name": "Chem P2", "targetDate": "2025-10-10T08:30"}, {"name": "Chem P3", "targetDate": "2025-10-28T08:30"}, {"name": "Physics P1", "targetDate": "2025-11-12T08:30"}, {"name": "Physics P2", "targetDate": "2025-10-15T08:30"}, {"name": "Physics P3", "targetDate": "2025-10-23T08:30"}]';
    importFromJsonString(presetJson, "AS Mth, Bio, Chm, Phy");
});

/**
 * Handles remove all timers button click.
 */
removeAllBtn.addEventListener("click", () => {
    if (timers.length === 0) {
        importExportStatusEl.textContent = "No timers to remove.";
        importExportStatusEl.className = "text-yellow-400 mt-3 text-sm h-4";
        clearStatus(importExportStatusEl);
        return;
    }

    // Confirm before removing all timers
    if (
        confirm(
            `Are you sure you want to remove all ${timers.length} timers?`
        )
    ) {
        timers = [];
        saveTimers();
        renderTimers();
        importExportStatusEl.textContent = "All timers removed successfully.";
        importExportStatusEl.className = "text-green-400 mt-3 text-sm h-4";
        clearStatus(importExportStatusEl);
    }
});

// Theme toggle
const themeToggle = document.getElementById("theme-toggle");
const sunIcon = document.getElementById("sun-icon");
const moonIcon = document.getElementById("moon-icon");
const html = document.documentElement;

// Load theme from localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    html.classList.add("dark");
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
} else {
    html.classList.remove("dark");
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
}

// Toggle theme
themeToggle.addEventListener("click", () => {
    if (html.classList.contains("dark")) {
        html.classList.remove("dark");
        localStorage.setItem("theme", "light");
        sunIcon.classList.remove("hidden");
        moonIcon.classList.add("hidden");
    } else {
        html.classList.add("dark");
        localStorage.setItem("theme", "dark");
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
    }
});

// --- App Initialization ---
initialize();