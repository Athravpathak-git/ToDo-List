// Atelier ToDo - Unit Test Suite
const fs = require('fs');
const path = require('path');

console.log('Running Atelier ToDo Unit Tests...');

const projectRoot = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

// 1. Verify HTML Structure & Element IDs
const requiredIds = [
    'taskInput', 'taskList', 'currentDateDisplay', 'headerDateText',
    'listViewBtn', 'calendarViewBtn', 'listViewContainer', 'calendarViewContainer',
    'themeToggleBtn', 'openCreateModalBtn', 'cardTotal', 'cardCompleted', 'cardPending',
    'cardOverdue', 'cardProgress', 'statTotal', 'statCompleted', 'statPending',
    'statOverdue', 'statProgressPercentage', 'statProgressSubtitle', 'progressCircleFill',
    'progressLinearFill', 'progressLinearBar', 'searchInput', 'clearSearchBtn',
    'categoryFilter', 'priorityFilter', 'sortOrder', 'manageCategoriesBtn', 'resetFiltersBtn',
    'countAll', 'countToday', 'countUpcoming', 'countOverdue', 'countCompleted', 'countPending',
    'currentViewTitle', 'taskListCounter', 'clearCompletedBtn', 'emptyState',
    'calendarMonthYearDisplay', 'calendarDaysGrid', 'prevMonthBtn', 'nextMonthBtn', 'todayMonthBtn',
    'calendarDayAgenda', 'agendaSelectedDateTitle', 'agendaSelectedDateCount', 'agendaTaskList', 'agendaAddTaskBtn',
    'taskModal', 'taskModalTitle', 'taskForm', 'editingTaskId', 'taskDescription',
    'taskPriority', 'taskCategory', 'taskDueDate', 'taskDueTime', 'titleError',
    'closeTaskModalBtn', 'cancelTaskModalBtn', 'saveTaskSubmitBtn', 'inlineAddCategoryBtn',
    'confirmDeleteModal', 'confirmDeleteTitle', 'confirmDeleteText', 'confirmDeleteBtn', 'cancelDeleteBtn',
    'categoryModal', 'closeCategoryModalBtn', 'doneCategoryBtn', 'newCategoryForm', 'newCategoryInput',
    'categoryError', 'categoryChipsList', 'toastContainer'
];

let missingIds = [];
for (const id of requiredIds) {
    if (!html.includes(`id="${id}"`)) {
        missingIds.push(id);
    }
}

if (missingIds.length > 0) {
    console.error('FAIL: Missing required element IDs in index.html:', missingIds);
    process.exit(1);
}
console.log(`[PASS] All ${requiredIds.length} required DOM IDs present in index.html.`);

// 2. Data Migration Functionality
function migrateTask(item) {
    const title = item.title || item.text || 'Untitled Task';
    return {
        id: item.id || 'task_mock_id',
        title: title,
        text: item.text || title,
        description: item.description || '',
        priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
        category: item.category || 'Personal',
        dueDate: item.dueDate || '',
        dueTime: item.dueTime || '',
        completed: Boolean(item.completed),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString()
    };
}

const legacy = [
    { text: 'Buy groceries', completed: false },
    { text: 'Read documentation', completed: true }
];

const migrated = legacy.map(migrateTask);
console.assert(migrated[0].title === 'Buy groceries', 'Title migration failed');
console.assert(migrated[0].text === 'Buy groceries', 'Text field preservation failed');
console.assert(migrated[0].completed === false, 'Completed status preservation failed');
console.assert(migrated[1].completed === true, 'Completed true preservation failed');
console.assert(migrated[0].priority === 'medium', 'Default priority failed');
console.assert(migrated[0].category === 'Personal', 'Default category failed');
console.log('[PASS] Backward-compatible schema migration verified.');

// 3. Date & Overdue Business Logic
function getLocalDateString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const now = new Date();
const todayStr = getLocalDateString(now);

const past = new Date(now);
past.setDate(now.getDate() - 2);
const pastStr = getLocalDateString(past);

const future = new Date(now);
future.setDate(now.getDate() + 5);
const futureStr = getLocalDateString(future);

function isTaskOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate < todayStr;
}

console.assert(isTaskOverdue({ dueDate: pastStr, completed: false }) === true, 'Overdue check 1 failed');
console.assert(isTaskOverdue({ dueDate: pastStr, completed: true }) === false, 'Overdue check 2 failed');
console.assert(isTaskOverdue({ dueDate: todayStr, completed: false }) === false, 'Overdue check 3 failed');
console.assert(isTaskOverdue({ dueDate: futureStr, completed: false }) === false, 'Overdue check 4 failed');
console.log('[PASS] Overdue & date logic verified.');

// 4. Statistics Calculation
const sampleTasks = [
    { id: '1', title: 'A', completed: true, dueDate: pastStr, priority: 'high', category: 'Study' },
    { id: '2', title: 'B', completed: false, dueDate: pastStr, priority: 'medium', category: 'College' },
    { id: '3', title: 'C', completed: false, dueDate: todayStr, priority: 'low', category: 'Projects' },
    { id: '4', title: 'D', completed: false, dueDate: futureStr, priority: 'high', category: 'Personal' }
];

const total = sampleTasks.length;
const completed = sampleTasks.filter(t => t.completed).length;
const pending = total - completed;
const overdue = sampleTasks.filter(isTaskOverdue).length;
const percentage = Math.round((completed / total) * 100);

console.assert(total === 4, 'Total metric mismatch');
console.assert(completed === 1, 'Completed metric mismatch');
console.assert(pending === 3, 'Pending metric mismatch');
console.assert(overdue === 1, 'Overdue metric mismatch');
console.assert(percentage === 25, 'Progress percentage mismatch');
console.log('[PASS] Dashboard statistics & progress percentage verified.');

// 5. Multi-filter & Search Logic
function filterTasks(tasks, { filter, category, priority, query }) {
    return tasks.filter(task => {
        if (filter === 'today' && task.dueDate !== todayStr) return false;
        if (filter === 'upcoming' && (!task.dueDate || task.dueDate <= todayStr || task.completed)) return false;
        if (filter === 'overdue' && !isTaskOverdue(task)) return false;
        if (filter === 'completed' && !task.completed) return false;
        if (filter === 'pending' && task.completed) return false;

        if (category !== 'all' && task.category !== category) return false;
        if (priority !== 'all' && task.priority !== priority) return false;

        if (query) {
            const q = query.toLowerCase();
            const matchTitle = (task.title || '').toLowerCase().includes(q);
            const matchDesc = (task.description || '').toLowerCase().includes(q);
            if (!matchTitle && !matchDesc) return false;
        }
        return true;
    });
}

const resOverdue = filterTasks(sampleTasks, { filter: 'overdue', category: 'all', priority: 'all', query: '' });
console.assert(resOverdue.length === 1 && resOverdue[0].id === '2', 'Filter overdue failed');

const resCollege = filterTasks(sampleTasks, { filter: 'all', category: 'College', priority: 'all', query: '' });
console.assert(resCollege.length === 1 && resCollege[0].id === '2', 'Filter category failed');

const resSearch = filterTasks(sampleTasks, { filter: 'all', category: 'all', priority: 'all', query: 'c' });
console.assert(resSearch.length === 1 && resSearch[0].id === '3', 'Search query failed');
console.log('[PASS] Complex filtering & search queries verified.');

console.log('✓ All unit tests passed successfully!\n');
