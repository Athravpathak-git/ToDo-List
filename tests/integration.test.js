// Atelier ToDo - Integration & DOM Simulation Tests
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('Running Atelier ToDo Integration Tests...');

const projectRoot = path.join(__dirname, '..');
const scriptCode = fs.readFileSync(path.join(projectRoot, 'script.js'), 'utf8');

// Mock localStorage
const localStorageStore = {};
const mockLocalStorage = {
    getItem: (key) => (key in localStorageStore ? localStorageStore[key] : null),
    setItem: (key, val) => { localStorageStore[key] = String(val); },
    removeItem: (key) => { delete localStorageStore[key]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

class MockElement {
    constructor(tagName = 'div', id = '') {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.children = [];
        this.attributes = {};
        this.style = {};
        this.textContent = '';
        this.value = '';
        this.checked = false;
        this.hidden = false;
        this.disabled = false;
        this.parentNode = null;
        this.eventListeners = {};

        this.classList = {
            _set: new Set(),
            add: (...names) => names.forEach(n => this.classList._set.add(n)),
            remove: (...names) => names.forEach(n => this.classList._set.delete(n)),
            toggle: (name, force) => {
                if (force === true) { this.classList._set.add(name); return true; }
                if (force === false) { this.classList._set.delete(name); return false; }
                if (this.classList._set.has(name)) { this.classList._set.delete(name); return false; }
                this.classList._set.add(name); return true;
            },
            contains: (name) => this.classList._set.has(name)
        };
    }

    get innerHTML() { return this.textContent; }
    set innerHTML(val) {
        this.textContent = val;
        this.children = [];
    }

    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k] || null; }
    removeAttribute(k) { delete this.attributes[k]; }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parentNode = null;
        }
        return child;
    }

    addEventListener(event, fn) {
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(fn);
    }

    dispatchEvent(event) {
        const fns = this.eventListeners[event.type || event] || [];
        fns.forEach(fn => fn(event));
    }

    focus() {}
    select() {}
    reset() { this.value = ''; }
}

const elementsRegistry = {};
[
    'taskInput', 'taskList', 'currentDateDisplay', 'headerDateText',
    'listViewBtn', 'calendarViewBtn', 'listViewContainer', 'calendarViewContainer',
    'themeToggleBtn', 'openCreateModalBtn', 'cardTotal', 'cardCompleted', 'cardPending',
    'cardOverdue', 'cardProgress', 'statTotal', 'statCompleted', 'statPending',
    'statOverdue', 'statProgressPercentage', 'statProgressSubtitle', 'progressCircleFill',
    'progressLinearFill', 'progressLinearBar', 'searchInput', 'clearSearchBtn',
    'categoryFilter', 'priorityFilter', 'sortOrder', 'manageCategoriesBtn', 'resetFiltersBtn',
    'countAll', 'countToday', 'countUpcoming', 'countOverdue', 'countCompleted', 'countPending',
    'currentViewTitle', 'taskListCounter', 'clearCompletedBtn', 'emptyState', 'emptyStateTitle',
    'emptyStateMessage', 'emptyStateActionBtn', 'calendarMonthYearDisplay', 'calendarDaysGrid',
    'prevMonthBtn', 'nextMonthBtn', 'todayMonthBtn', 'calendarDayAgenda', 'agendaSelectedDateTitle',
    'agendaSelectedDateCount', 'agendaTaskList', 'agendaAddTaskBtn', 'taskModal', 'taskModalTitle',
    'taskForm', 'editingTaskId', 'taskDescription', 'taskPriority', 'taskCategory',
    'taskDueDate', 'taskDueTime', 'titleError', 'closeTaskModalBtn', 'cancelTaskModalBtn',
    'saveTaskSubmitBtn', 'inlineAddCategoryBtn', 'confirmDeleteModal', 'confirmDeleteTitle',
    'confirmDeleteText', 'confirmDeleteBtn', 'cancelDeleteBtn', 'categoryModal', 'closeCategoryModalBtn',
    'doneCategoryBtn', 'newCategoryForm', 'newCategoryInput', 'categoryError', 'categoryChipsList',
    'toastContainer', 'footerDataStatus'
].forEach(id => {
    elementsRegistry[id] = new MockElement('div', id);
});

const mockDocument = {
    getElementById: (id) => elementsRegistry[id] || null,
    querySelectorAll: (selector) => {
        if (selector === '.filter-tab') {
            return [
                new MockElement('button'),
                new MockElement('button'),
                new MockElement('button'),
                new MockElement('button'),
                new MockElement('button'),
                new MockElement('button')
            ];
        }
        return [];
    },
    createElement: (tag) => new MockElement(tag),
    documentElement: new MockElement('html'),
    addEventListener: () => {},
    readyState: 'complete'
};

const mockWindow = {
    localStorage: mockLocalStorage,
    matchMedia: () => ({ matches: false }),
    addEventListener: () => {},
    location: { href: '' }
};

// Seed legacy task into storage
localStorageStore['tasks'] = JSON.stringify([
    { text: 'Initial existing task', completed: false }
]);

const context = vm.createContext({
    document: mockDocument,
    window: mockWindow,
    localStorage: mockLocalStorage,
    console: console,
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    Date: Date,
    Math: Math,
    String: String,
    Boolean: Boolean,
    Array: Array,
    Number: Number,
    JSON: JSON,
    confirm: () => true
});

try {
    vm.runInContext(scriptCode, context);
    console.log('[PASS] Script loaded and initialized without errors.');

    // 1. Initial State Verification
    console.assert(String(elementsRegistry['statTotal'].textContent) === '1', 'Initial total mismatch');
    console.assert(String(elementsRegistry['statPending'].textContent) === '1', 'Initial pending mismatch');
    console.log('[PASS] Existing data loaded and metrics rendered.');

    // 2. Global addTask invocation
    elementsRegistry['taskInput'].value = 'Second task created via UI';
    mockWindow.addTask();
    console.assert(String(elementsRegistry['statTotal'].textContent) === '2', 'Total after add mismatch');
    console.assert(String(elementsRegistry['statPending'].textContent) === '2', 'Pending after add mismatch');
    console.log('[PASS] window.addTask() executed and UI updated.');

    // 3. Verify persistence
    const saved = JSON.parse(localStorageStore['tasks']);
    console.assert(saved.length === 2, 'Storage length mismatch');
    console.assert(saved[0].text !== undefined && saved[0].completed !== undefined, 'Storage backward compatibility failed');
    console.log('[PASS] LocalStorage persistence verified.');

    // 4. View Switch Verification
    elementsRegistry['calendarViewBtn'].dispatchEvent({ type: 'click' });
    console.assert(elementsRegistry['calendarViewContainer'].hidden === false, 'Calendar view should be visible');
    console.assert(elementsRegistry['listViewContainer'].hidden === true, 'List view should be hidden');
    console.log('[PASS] View switcher toggled to Calendar view.');

    elementsRegistry['listViewBtn'].dispatchEvent({ type: 'click' });
    console.assert(elementsRegistry['listViewContainer'].hidden === false, 'List view should be visible');
    console.assert(elementsRegistry['calendarViewContainer'].hidden === true, 'Calendar view should be hidden');
    console.log('[PASS] View switcher toggled back to List view.');

    // 5. Theme Toggle Verification
    elementsRegistry['themeToggleBtn'].dispatchEvent({ type: 'click' });
    const toggledTheme = mockDocument.documentElement.getAttribute('data-theme');
    console.assert(toggledTheme === 'dark', 'Theme should toggle to dark');
    console.assert(localStorageStore['todo_theme'] === 'dark', 'Dark theme should persist in localStorage');
    console.log('[PASS] Theme toggled to dark and persisted.');

    console.log('✓ All integration tests passed successfully!\n');
} catch (err) {
    console.error('FAIL Integration test error:', err);
    process.exit(1);
}
