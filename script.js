/**
 * Atelier Productivity Dashboard
 * Complete vanilla JavaScript implementation for task architecture,
 * dashboard metrics, calendar engine, categorization, theme management,
 * and robust local persistence.
 */

(function () {
    'use strict';

    // =========================================================================
    // Constants & Default Configuration
    // =========================================================================

    const STORAGE_KEY_TASKS = 'tasks';
    const STORAGE_KEY_CATEGORIES = 'todo_categories';
    const STORAGE_KEY_THEME = 'todo_theme';
    const STORAGE_KEY_VIEW = 'todo_active_view';

    const DEFAULT_CATEGORIES = ['Personal', 'Study', 'College', 'Projects'];

    // =========================================================================
    // Application State
    // =========================================================================

    let state = {
        tasks: [],
        categories: [...DEFAULT_CATEGORIES],
        activeView: 'list', // 'list' | 'calendar'
        activeFilter: 'all', // 'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'pending'
        activeCategory: 'all',
        activePriority: 'all',
        searchQuery: '',
        sortBy: 'dueDate-asc',
        calendarDate: new Date(), // For month navigation
        selectedCalendarDay: null, // Selected date string 'YYYY-MM-DD'
        lastDeletedTask: null, // For undo functionality
        deleteTargetId: null // Task ID targeted for deletion
    };

    // =========================================================================
    // DOM Elements Cache
    // =========================================================================

    const DOM = {
        // Layout & View switches
        listViewBtn: document.getElementById('listViewBtn'),
        calendarViewBtn: document.getElementById('calendarViewBtn'),
        listViewContainer: document.getElementById('listViewContainer'),
        calendarViewContainer: document.getElementById('calendarViewContainer'),
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        currentDateDisplay: document.getElementById('headerDateText'),

        // Metrics
        statTotal: document.getElementById('statTotal'),
        statCompleted: document.getElementById('statCompleted'),
        statPending: document.getElementById('statPending'),
        statOverdue: document.getElementById('statOverdue'),
        statProgressPercentage: document.getElementById('statProgressPercentage'),
        statProgressSubtitle: document.getElementById('statProgressSubtitle'),
        progressCircleFill: document.getElementById('progressCircleFill'),
        progressLinearFill: document.getElementById('progressLinearFill'),
        progressLinearBar: document.getElementById('progressLinearBar'),

        // Controls & Filters
        searchInput: document.getElementById('searchInput'),
        clearSearchBtn: document.getElementById('clearSearchBtn'),
        filterTabs: document.querySelectorAll('.filter-tab'),
        categoryFilter: document.getElementById('categoryFilter'),
        priorityFilter: document.getElementById('priorityFilter'),
        sortOrder: document.getElementById('sortOrder'),
        resetFiltersBtn: document.getElementById('resetFiltersBtn'),
        manageCategoriesBtn: document.getElementById('manageCategoriesBtn'),

        // Filter Counts
        countAll: document.getElementById('countAll'),
        countToday: document.getElementById('countToday'),
        countUpcoming: document.getElementById('countUpcoming'),
        countOverdue: document.getElementById('countOverdue'),
        countCompleted: document.getElementById('countCompleted'),
        countPending: document.getElementById('countPending'),

        // List View Elements
        taskList: document.getElementById('taskList'),
        currentViewTitle: document.getElementById('currentViewTitle'),
        taskListCounter: document.getElementById('taskListCounter'),
        clearCompletedBtn: document.getElementById('clearCompletedBtn'),
        emptyState: document.getElementById('emptyState'),
        emptyStateTitle: document.getElementById('emptyStateTitle'),
        emptyStateMessage: document.getElementById('emptyStateMessage'),
        emptyStateActionBtn: document.getElementById('emptyStateActionBtn'),

        // Calendar View Elements
        calendarMonthYearDisplay: document.getElementById('calendarMonthYearDisplay'),
        calendarDaysGrid: document.getElementById('calendarDaysGrid'),
        prevMonthBtn: document.getElementById('prevMonthBtn'),
        nextMonthBtn: document.getElementById('nextMonthBtn'),
        todayMonthBtn: document.getElementById('todayMonthBtn'),
        calendarDayAgenda: document.getElementById('calendarDayAgenda'),
        agendaSelectedDateTitle: document.getElementById('agendaSelectedDateTitle'),
        agendaSelectedDateCount: document.getElementById('agendaSelectedDateCount'),
        agendaTaskList: document.getElementById('agendaTaskList'),
        agendaAddTaskBtn: document.getElementById('agendaAddTaskBtn'),

        // Modals: Task Form
        taskModal: document.getElementById('taskModal'),
        taskModalTitle: document.getElementById('taskModalTitle'),
        taskForm: document.getElementById('taskForm'),
        editingTaskId: document.getElementById('editingTaskId'),
        taskInput: document.getElementById('taskInput'),
        taskDescription: document.getElementById('taskDescription'),
        taskPriority: document.getElementById('taskPriority'),
        taskCategory: document.getElementById('taskCategory'),
        taskDueDate: document.getElementById('taskDueDate'),
        taskDueTime: document.getElementById('taskDueTime'),
        titleError: document.getElementById('titleError'),
        openCreateModalBtn: document.getElementById('openCreateModalBtn'),
        closeTaskModalBtn: document.getElementById('closeTaskModalBtn'),
        cancelTaskModalBtn: document.getElementById('cancelTaskModalBtn'),
        saveTaskSubmitBtn: document.getElementById('saveTaskSubmitBtn'),
        inlineAddCategoryBtn: document.getElementById('inlineAddCategoryBtn'),

        // Modals: Delete Confirmation
        confirmDeleteModal: document.getElementById('confirmDeleteModal'),
        confirmDeleteTitle: document.getElementById('confirmDeleteTitle'),
        confirmDeleteText: document.getElementById('confirmDeleteText'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),

        // Modals: Category Manager
        categoryModal: document.getElementById('categoryModal'),
        closeCategoryModalBtn: document.getElementById('closeCategoryModalBtn'),
        doneCategoryBtn: document.getElementById('doneCategoryBtn'),
        newCategoryForm: document.getElementById('newCategoryForm'),
        newCategoryInput: document.getElementById('newCategoryInput'),
        categoryError: document.getElementById('categoryError'),
        categoryChipsList: document.getElementById('categoryChipsList'),

        // Toast Container
        toastContainer: document.getElementById('toastContainer')
    };

    // =========================================================================
    // Utilities & Helpers
    // =========================================================================

    /**
     * Generate unique task identifier.
     */
    function generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * Escape HTML string safely for attribute embedding when needed.
     */
    function sanitizeText(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Get local date string 'YYYY-MM-DD' from Date object.
     */
    function getLocalDateString(date) {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Return today's local date in 'YYYY-MM-DD'.
     */
    function getTodayString() {
        return getLocalDateString(new Date());
    }

    /**
     * Format a date string 'YYYY-MM-DD' to elegant display string.
     */
    function formatDisplayDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);

        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    }

    /**
     * Compute relative date label (e.g., 'Today', 'Tomorrow', 'Overdue by 2 days').
     */
    function getRelativeDueDateLabel(dueDateStr, isCompleted) {
        if (!dueDateStr) return null;
        const todayStr = getTodayString();

        if (dueDateStr === todayStr) {
            return { label: 'Today', isOverdue: false, isToday: true };
        }

        const todayParts = todayStr.split('-').map(Number);
        const dueParts = dueDateStr.split('-').map(Number);

        const todayDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
        const dueDate = new Date(dueParts[0], dueParts[1] - 1, dueParts[2]);

        const diffTime = dueDate.getTime() - todayDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return { label: 'Tomorrow', isOverdue: false, isToday: false };
        } else if (diffDays === -1) {
            return {
                label: isCompleted ? 'Yesterday' : 'Overdue by 1 day',
                isOverdue: !isCompleted,
                isToday: false
            };
        } else if (diffDays < -1) {
            return {
                label: isCompleted ? formatDisplayDate(dueDateStr) : `Overdue by ${Math.abs(diffDays)} days`,
                isOverdue: !isCompleted,
                isToday: false
            };
        } else if (diffDays <= 7) {
            return { label: `In ${diffDays} days`, isOverdue: false, isToday: false };
        } else {
            return { label: formatDisplayDate(dueDateStr), isOverdue: false, isToday: false };
        }
    }

    /**
     * Check if a task is overdue.
     */
    function isTaskOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        return task.dueDate < getTodayString();
    }

    // =========================================================================
    // Data Persistence & Safe Migration
    // =========================================================================

    /**
     * Load tasks from localStorage with safe schema migration and error resilience.
     */
    function loadTasks() {
        let rawData = null;
        try {
            rawData = localStorage.getItem(STORAGE_KEY_TASKS);
            if (!rawData) {
                state.tasks = [];
                return;
            }

            const parsed = JSON.parse(rawData);
            if (!Array.isArray(parsed)) {
                console.warn('Atelier: Corrupted tasks format in localStorage; initializing empty task list.');
                state.tasks = [];
                return;
            }

            // Migrate existing tasks cleanly while preserving existing data
            state.tasks = parsed.map(item => {
                const title = item.title || item.text || 'Untitled Task';
                return {
                    id: item.id || generateId(),
                    title: title,
                    text: item.text || title, // Preserves legacy compatibility
                    description: item.description || '',
                    priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
                    category: item.category || 'Personal',
                    dueDate: item.dueDate || '',
                    dueTime: item.dueTime || '',
                    completed: Boolean(item.completed),
                    createdAt: item.createdAt || new Date().toISOString(),
                    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString()
                };
            });
        } catch (error) {
            console.error('Atelier: Failed to load tasks from localStorage:', error);
            state.tasks = [];
        }
    }

    /**
     * Save tasks to localStorage preserving both upgraded schema and legacy text property.
     */
    function saveTasks() {
        try {
            // Keep text in sync with title for external/legacy compatibility
            const payload = state.tasks.map(task => ({
                ...task,
                text: task.title
            }));
            localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(payload));
            updateFooterStatus('Saved locally');
        } catch (error) {
            console.error('Atelier: Failed to save tasks to localStorage:', error);
            showToast('Unable to save changes to local storage', 'danger');
        }
    }

    /**
     * Load categories from localStorage.
     */
    function loadCategories() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Combine default categories with stored ones, preserving uniqueness
                    const combined = Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed]));
                    state.categories = combined;
                    return;
                }
            }
            state.categories = [...DEFAULT_CATEGORIES];
        } catch (e) {
            state.categories = [...DEFAULT_CATEGORIES];
        }
    }

    /**
     * Save categories to localStorage.
     */
    function saveCategories() {
        try {
            localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(state.categories));
        } catch (e) {
            console.error('Atelier: Failed to save categories:', e);
        }
    }

    function updateFooterStatus(msg) {
        const statusEl = document.getElementById('footerDataStatus');
        if (statusEl) {
            statusEl.textContent = msg;
            setTimeout(() => {
                statusEl.textContent = 'Local Data Synced';
            }, 2500);
        }
    }

    // =========================================================================
    // Theme Management
    // =========================================================================

    function initTheme() {
        try {
            const storedTheme = localStorage.getItem(STORAGE_KEY_THEME);
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = storedTheme || (prefersDark ? 'dark' : 'light');
            applyTheme(theme);
        } catch (e) {
            applyTheme('light');
        }

        if (DOM.themeToggleBtn) {
            DOM.themeToggleBtn.addEventListener('click', toggleTheme);
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(STORAGE_KEY_THEME, theme);
        } catch (e) {}

        if (DOM.themeToggleBtn) {
            DOM.themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
            DOM.themeToggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`);
    }

    // =========================================================================
    // Toast Notification System
    // =========================================================================

    function showToast(message, type = 'info', actionText = null, onAction = null) {
        if (!DOM.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'danger' ? 'toast-danger' : ''}`;
        toast.setAttribute('role', 'status');

        const textSpan = document.createElement('span');
        textSpan.textContent = message;
        toast.appendChild(textSpan);

        if (actionText && typeof onAction === 'function') {
            const actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.className = 'toast-action';
            actionBtn.textContent = actionText;
            actionBtn.onclick = function () {
                onAction();
                dismissToast(toast);
            };
            toast.appendChild(actionBtn);
        }

        DOM.toastContainer.appendChild(toast);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            dismissToast(toast);
        }, 4000);
    }

    function dismissToast(toast) {
        if (!toast || !toast.parentNode) return;
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 250);
    }

    // =========================================================================
    // Dashboard Analytics & Progress
    // =========================================================================

    function updateDashboardMetrics() {
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const overdue = state.tasks.filter(isTaskOverdue).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Stat cards
        if (DOM.statTotal) DOM.statTotal.textContent = total;
        if (DOM.statCompleted) DOM.statCompleted.textContent = completed;
        if (DOM.statPending) DOM.statPending.textContent = pending;
        if (DOM.statOverdue) DOM.statOverdue.textContent = overdue;

        // Progress text
        if (DOM.statProgressPercentage) DOM.statProgressPercentage.textContent = `${percentage}%`;
        if (DOM.statProgressSubtitle) {
            DOM.statProgressSubtitle.textContent = `${completed} of ${total} tasks done`;
        }

        // SVG Radial Progress
        // Circumference of r=42 is 2 * PI * 42 ≈ 263.89
        const circumference = 263.89;
        if (DOM.progressCircleFill) {
            const offset = circumference - (percentage / 100) * circumference;
            DOM.progressCircleFill.style.strokeDashoffset = offset;
        }

        // Linear Progress Bar
        if (DOM.progressLinearFill) {
            DOM.progressLinearFill.style.width = `${percentage}%`;
        }
        if (DOM.progressLinearBar) {
            DOM.progressLinearBar.setAttribute('aria-valuenow', percentage);
        }

        // Tab Counts
        updateFilterTabCounts();
    }

    function updateFilterTabCounts() {
        const todayStr = getTodayString();
        const total = state.tasks.length;
        const todayCount = state.tasks.filter(t => t.dueDate === todayStr).length;
        const upcomingCount = state.tasks.filter(t => t.dueDate && t.dueDate > todayStr && !t.completed).length;
        const overdueCount = state.tasks.filter(isTaskOverdue).length;
        const completedCount = state.tasks.filter(t => t.completed).length;
        const pendingCount = state.tasks.filter(t => !t.completed).length;

        if (DOM.countAll) DOM.countAll.textContent = total;
        if (DOM.countToday) DOM.countToday.textContent = todayCount;
        if (DOM.countUpcoming) DOM.countUpcoming.textContent = upcomingCount;
        if (DOM.countOverdue) DOM.countOverdue.textContent = overdueCount;
        if (DOM.countCompleted) DOM.countCompleted.textContent = completedCount;
        if (DOM.countPending) DOM.countPending.textContent = pendingCount;

        // Toggle clear completed button
        if (DOM.clearCompletedBtn) {
            DOM.clearCompletedBtn.hidden = completedCount === 0;
        }
    }

    // =========================================================================
    // Category Population & Management
    // =========================================================================

    function renderCategoryOptions() {
        const categoryFilterVal = DOM.categoryFilter ? DOM.categoryFilter.value : 'all';
        const taskCategoryVal = DOM.taskCategory ? DOM.taskCategory.value : 'Personal';

        // 1. Filter dropdown
        if (DOM.categoryFilter) {
            DOM.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            state.categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                if (cat === categoryFilterVal) opt.selected = true;
                DOM.categoryFilter.appendChild(opt);
            });
        }

        // 2. Task modal dropdown
        if (DOM.taskCategory) {
            DOM.taskCategory.innerHTML = '';
            state.categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                if (cat === taskCategoryVal) opt.selected = true;
                DOM.taskCategory.appendChild(opt);
            });
        }

        // 3. Category chips inside management modal
        if (DOM.categoryChipsList) {
            DOM.categoryChipsList.innerHTML = '';
            state.categories.forEach(cat => {
                const li = document.createElement('li');
                li.className = 'category-chip';

                const nameSpan = document.createElement('span');
                nameSpan.textContent = cat;
                li.appendChild(nameSpan);

                // Allow deleting only custom categories
                if (!DEFAULT_CATEGORIES.includes(cat)) {
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'chip-remove-btn';
                    removeBtn.innerHTML = '&times;';
                    removeBtn.setAttribute('aria-label', `Remove category ${cat}`);
                    removeBtn.onclick = () => removeCustomCategory(cat);
                    li.appendChild(removeBtn);
                }

                DOM.categoryChipsList.appendChild(li);
            });
        }
    }

    function addCustomCategory(name) {
        const trimmed = (name || '').trim();
        if (!trimmed) {
            if (DOM.categoryError) {
                DOM.categoryError.textContent = 'Please provide a valid category name.';
                DOM.categoryError.hidden = false;
            }
            return false;
        }

        const exists = state.categories.some(c => c.toLowerCase() === trimmed.toLowerCase());
        if (exists) {
            if (DOM.categoryError) {
                DOM.categoryError.textContent = 'A category with this name already exists.';
                DOM.categoryError.hidden = false;
            }
            return false;
        }

        if (DOM.categoryError) DOM.categoryError.hidden = true;
        state.categories.push(trimmed);
        saveCategories();
        renderCategoryOptions();
        showToast(`Category "${trimmed}" added`);
        return true;
    }

    function removeCustomCategory(cat) {
        state.categories = state.categories.filter(c => c !== cat);
        // If any task had this category, keep it or fallback
        saveCategories();
        renderCategoryOptions();
        showToast(`Category "${cat}" removed`);
    }

    // =========================================================================
    // Filter, Search & Sort Logic
    // =========================================================================

    function getFilteredAndSortedTasks() {
        const todayStr = getTodayString();
        const query = (state.searchQuery || '').toLowerCase().trim();

        // 1. Filter
        let result = state.tasks.filter(task => {
            // Status Filter
            switch (state.activeFilter) {
                case 'today':
                    if (task.dueDate !== todayStr) return false;
                    break;
                case 'upcoming':
                    if (!task.dueDate || task.dueDate <= todayStr || task.completed) return false;
                    break;
                case 'overdue':
                    if (!isTaskOverdue(task)) return false;
                    break;
                case 'completed':
                    if (!task.completed) return false;
                    break;
                case 'pending':
                    if (task.completed) return false;
                    break;
                case 'all':
                default:
                    break;
            }

            // Category Filter
            if (state.activeCategory !== 'all' && task.category !== state.activeCategory) {
                return false;
            }

            // Priority Filter
            if (state.activePriority !== 'all' && task.priority !== state.activePriority) {
                return false;
            }

            // Search Query Filter (Title & Description)
            if (query) {
                const titleMatch = (task.title || '').toLowerCase().includes(query);
                const descMatch = (task.description || '').toLowerCase().includes(query);
                if (!titleMatch && !descMatch) return false;
            }

            return true;
        });

        // 2. Sort
        const priorityWeight = { high: 3, medium: 2, low: 1 };

        result.sort((a, b) => {
            switch (state.sortBy) {
                case 'dueDate-asc': {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return a.dueDate.localeCompare(b.dueDate);
                }
                case 'dueDate-desc': {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return b.dueDate.localeCompare(a.dueDate);
                }
                case 'priority-desc': {
                    const weightDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
                    if (weightDiff !== 0) return weightDiff;
                    return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
                }
                case 'createdAt-desc': {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                case 'createdAt-asc': {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                }
                case 'title-asc': {
                    return (a.title || '').localeCompare(b.title || '');
                }
                default:
                    return 0;
            }
        });

        return result;
    }

    // =========================================================================
    // List View Rendering
    // =========================================================================

    function renderTaskList() {
        if (!DOM.taskList) return;

        const filteredTasks = getFilteredAndSortedTasks();
        DOM.taskList.innerHTML = '';

        // Update list title and count
        const filterTitleMap = {
            all: 'All Tasks',
            today: "Today's Tasks",
            upcoming: 'Upcoming Tasks',
            overdue: 'Overdue Tasks',
            completed: 'Completed Tasks',
            pending: 'Pending Tasks'
        };

        if (DOM.currentViewTitle) {
            DOM.currentViewTitle.textContent = filterTitleMap[state.activeFilter] || 'Tasks';
        }

        if (DOM.taskListCounter) {
            const countText = filteredTasks.length === 1 ? '1 task' : `${filteredTasks.length} tasks`;
            DOM.taskListCounter.textContent = `Showing ${countText}`;
        }

        // Check if any filters are active to show reset button
        const isFiltered = state.activeFilter !== 'all' ||
            state.activeCategory !== 'all' ||
            state.activePriority !== 'all' ||
            state.searchQuery.trim() !== '';

        if (DOM.resetFiltersBtn) {
            DOM.resetFiltersBtn.hidden = !isFiltered;
        }

        // Handle empty state
        if (filteredTasks.length === 0) {
            DOM.taskList.hidden = true;
            if (DOM.emptyState) {
                DOM.emptyState.hidden = false;
                if (state.searchQuery.trim()) {
                    DOM.emptyStateTitle.textContent = 'No matching tasks';
                    DOM.emptyStateMessage.textContent = `No tasks matched your search "${state.searchQuery}". Try a different keyword or clear the search.`;
                } else if (state.activeFilter === 'overdue') {
                    DOM.emptyStateTitle.textContent = 'No overdue tasks';
                    DOM.emptyStateMessage.textContent = 'Outstanding! All scheduled deadlines are up to date.';
                } else if (state.activeFilter === 'today') {
                    DOM.emptyStateTitle.textContent = 'No tasks for today';
                    DOM.emptyStateMessage.textContent = 'Your schedule is clear for today. Plan ahead or take time to recharge.';
                } else if (state.activeFilter === 'completed') {
                    DOM.emptyStateTitle.textContent = 'No completed tasks yet';
                    DOM.emptyStateMessage.textContent = 'Check off tasks as you finish them to track your accomplishments.';
                } else {
                    DOM.emptyStateTitle.textContent = 'No tasks found';
                    DOM.emptyStateMessage.textContent = 'Get started by creating your first task to stay organized and productive.';
                }
            }
            return;
        }

        DOM.taskList.hidden = false;
        if (DOM.emptyState) DOM.emptyState.hidden = true;

        // Render each task card using safe DOM creation (Prevents XSS completely)
        filteredTasks.forEach(task => {
            const li = createTaskCardElement(task);
            DOM.taskList.appendChild(li);
        });
    }

    /**
     * Create single task DOM card with accessible markup and security best practices.
     */
    function createTaskCardElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.setAttribute('data-id', task.id);
        li.setAttribute('role', 'listitem');

        const overdue = isTaskOverdue(task);
        if (task.completed) li.classList.add('completed-task');
        if (overdue) li.classList.add('is-overdue');

        // 1. Checkbox Wrapper
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'task-checkbox-wrapper';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'pending' : 'completed'}`);

        checkbox.addEventListener('change', function () {
            toggleTaskCompletion(task.id);
        });
        checkboxWrapper.appendChild(checkbox);

        // 2. Main Content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-main-content';

        // Title Row
        const headlineRow = document.createElement('div');
        headlineRow.className = 'task-headline-row';

        const titleSpan = document.createElement('h3');
        titleSpan.className = 'task-title-text';
        titleSpan.textContent = task.title;
        titleSpan.addEventListener('click', function () {
            toggleTaskCompletion(task.id);
        });
        headlineRow.appendChild(titleSpan);
        contentDiv.appendChild(headlineRow);

        // Optional Description
        if (task.description && task.description.trim()) {
            const descP = document.createElement('p');
            descP.className = 'task-description-text';
            descP.textContent = task.description;
            contentDiv.appendChild(descP);
        }

        // Badges Row
        const badgesRow = document.createElement('div');
        badgesRow.className = 'task-badges-row';

        // Priority Badge
        const priorityBadge = document.createElement('span');
        priorityBadge.className = `badge badge-priority-${task.priority}`;
        priorityBadge.textContent = task.priority;
        badgesRow.appendChild(priorityBadge);

        // Category Badge
        if (task.category) {
            const catBadge = document.createElement('span');
            catBadge.className = 'badge badge-category';
            catBadge.textContent = task.category;
            badgesRow.appendChild(catBadge);
        }

        // Due Date Badge
        if (task.dueDate) {
            const rel = getRelativeDueDateLabel(task.dueDate, task.completed);
            const dueBadge = document.createElement('span');
            dueBadge.className = 'badge badge-due-date';
            if (rel.isOverdue) dueBadge.classList.add('badge-overdue');
            if (rel.isToday) dueBadge.classList.add('badge-today');

            let dueText = rel.label;
            if (task.dueTime) {
                dueText += ` • ${task.dueTime}`;
            }
            dueBadge.textContent = `📅 ${dueText}`;
            badgesRow.appendChild(dueBadge);
        }

        // Updated Note
        const timeNote = document.createElement('span');
        timeNote.className = 'task-timestamp-note';
        const updatedDate = new Date(task.updatedAt || task.createdAt);
        timeNote.textContent = `Updated ${updatedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        badgesRow.appendChild(timeNote);

        contentDiv.appendChild(badgesRow);

        // 3. Action Buttons Group (Edit & Delete)
        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'task-actions-group';

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'task-action-btn edit-action-btn';
        editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
        editBtn.setAttribute('title', 'Edit Task');
        editBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
        `;
        editBtn.onclick = function (e) {
            e.stopPropagation();
            openEditTaskModal(task.id);
        };
        actionsGroup.appendChild(editBtn);

        // Delete Button
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'task-action-btn delete-action-btn';
        delBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
        delBtn.setAttribute('title', 'Delete Task');
        delBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        `;
        delBtn.onclick = function (e) {
            e.stopPropagation();
            openDeleteConfirmation(task.id);
        };
        actionsGroup.appendChild(delBtn);

        li.appendChild(checkboxWrapper);
        li.appendChild(contentDiv);
        li.appendChild(actionsGroup);

        return li;
    }

    // =========================================================================
    // Calendar View Engine
    // =========================================================================

    function renderCalendar() {
        if (!DOM.calendarDaysGrid) return;

        const currentYear = state.calendarDate.getFullYear();
        const currentMonth = state.calendarDate.getMonth();

        // Month Header Display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        if (DOM.calendarMonthYearDisplay) {
            DOM.calendarMonthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }

        // First day of month and total days
        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

        DOM.calendarDaysGrid.innerHTML = '';

        const todayStr = getTodayString();
        if (!state.selectedCalendarDay) {
            state.selectedCalendarDay = todayStr;
        }

        // Previous month filler days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDay - i;
            const prevMonthDate = new Date(currentYear, currentMonth - 1, dayNum);
            const dateStr = getLocalDateString(prevMonthDate);

            const cell = createCalendarDayCell(dayNum, dateStr, true);
            DOM.calendarDaysGrid.appendChild(cell);
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const currentMonthDate = new Date(currentYear, currentMonth, d);
            const dateStr = getLocalDateString(currentMonthDate);

            const cell = createCalendarDayCell(d, dateStr, false);
            DOM.calendarDaysGrid.appendChild(cell);
        }

        // Next month filler days (fill up to grid of 35 or 42 cells)
        const totalRendered = firstDayIndex + daysInMonth;
        const remainingCells = totalRendered <= 35 ? 35 - totalRendered : 42 - totalRendered;

        for (let n = 1; n <= remainingCells; n++) {
            const nextMonthDate = new Date(currentYear, currentMonth + 1, n);
            const dateStr = getLocalDateString(nextMonthDate);

            const cell = createCalendarDayCell(n, dateStr, true);
            DOM.calendarDaysGrid.appendChild(cell);
        }

        // Render agenda for currently selected day
        renderCalendarAgenda(state.selectedCalendarDay);
    }

    function createCalendarDayCell(dayNum, dateStr, isOtherMonth) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell';
        cell.setAttribute('data-date', dateStr);

        const todayStr = getTodayString();
        if (dateStr === todayStr) cell.classList.add('is-today');
        if (isOtherMonth) cell.classList.add('other-month');
        if (dateStr === state.selectedCalendarDay) cell.classList.add('selected-day');

        // Top Row (Day Number)
        const topRow = document.createElement('div');
        topRow.className = 'day-cell-top';

        const numSpan = document.createElement('span');
        numSpan.className = 'day-number';
        numSpan.textContent = dayNum;
        topRow.appendChild(numSpan);
        cell.appendChild(topRow);

        // Find tasks scheduled on this day
        const dayTasks = state.tasks.filter(t => t.dueDate === dateStr);

        if (dayTasks.length > 0) {
            const indicatorsDiv = document.createElement('div');
            indicatorsDiv.className = 'day-task-indicators';

            // Show up to 2 pills, then "+X more"
            const maxPills = 2;
            dayTasks.slice(0, maxPills).forEach(task => {
                const pill = document.createElement('div');
                pill.className = 'day-task-pill';
                if (task.completed) pill.classList.add('pill-completed');
                else if (isTaskOverdue(task)) pill.classList.add('pill-overdue');
                else if (task.priority === 'high') pill.classList.add('pill-high');

                pill.textContent = task.title;
                indicatorsDiv.appendChild(pill);
            });

            if (dayTasks.length > maxPills) {
                const morePill = document.createElement('div');
                morePill.className = 'day-task-pill';
                morePill.textContent = `+${dayTasks.length - maxPills} more`;
                indicatorsDiv.appendChild(morePill);
            }

            cell.appendChild(indicatorsDiv);
        }

        // Click handler to select day & inspect agenda
        cell.addEventListener('click', function () {
            selectCalendarDay(dateStr);
        });

        return cell;
    }

    function selectCalendarDay(dateStr) {
        state.selectedCalendarDay = dateStr;

        // Update active class on cells
        const cells = document.querySelectorAll('.calendar-day-cell');
        cells.forEach(c => {
            if (c.getAttribute('data-date') === dateStr) {
                c.classList.add('selected-day');
            } else {
                c.classList.remove('selected-day');
            }
        });

        renderCalendarAgenda(dateStr);
    }

    function renderCalendarAgenda(dateStr) {
        if (!DOM.agendaTaskList || !DOM.agendaSelectedDateTitle) return;

        const dayTasks = state.tasks.filter(t => t.dueDate === dateStr);
        const formatted = formatDisplayDate(dateStr) || dateStr;

        DOM.agendaSelectedDateTitle.textContent = `Tasks for ${formatted}`;
        DOM.agendaSelectedDateCount.textContent = dayTasks.length === 1 ? '1 task' : `${dayTasks.length} tasks scheduled`;

        DOM.agendaTaskList.innerHTML = '';

        if (dayTasks.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.className = 'empty-agenda-text';
            emptyLi.style.fontSize = '0.86rem';
            emptyLi.style.color = 'var(--text-muted)';
            emptyLi.style.padding = '8px 0';
            emptyLi.textContent = 'No tasks scheduled for this day.';
            DOM.agendaTaskList.appendChild(emptyLi);
            return;
        }

        dayTasks.forEach(task => {
            const card = createTaskCardElement(task);
            DOM.agendaTaskList.appendChild(card);
        });
    }

    // =========================================================================
    // Task CRUD Operations
    // =========================================================================

    /**
     * Create or update task from modal form submission.
     */
    function handleTaskFormSubmit(e) {
        e.preventDefault();

        const title = (DOM.taskInput.value || '').trim();
        if (!title) {
            if (DOM.titleError) {
                DOM.titleError.textContent = 'Please provide a valid task title.';
                DOM.titleError.hidden = false;
            }
            DOM.taskInput.focus();
            return;
        }

        if (DOM.titleError) DOM.titleError.hidden = true;

        const id = DOM.editingTaskId.value;
        const description = (DOM.taskDescription.value || '').trim();
        const priority = DOM.taskPriority.value || 'medium';
        const category = DOM.taskCategory.value || 'Personal';
        const dueDate = DOM.taskDueDate.value || '';
        const dueTime = DOM.taskDueTime.value || '';

        // Prevent duplicate fast submissions
        DOM.saveTaskSubmitBtn.disabled = true;

        if (id) {
            // Edit existing task
            const taskIndex = state.tasks.findIndex(t => t.id === id);
            if (taskIndex !== -1) {
                state.tasks[taskIndex].title = title;
                state.tasks[taskIndex].text = title; // Legacy sync
                state.tasks[taskIndex].description = description;
                state.tasks[taskIndex].priority = priority;
                state.tasks[taskIndex].category = category;
                state.tasks[taskIndex].dueDate = dueDate;
                state.tasks[taskIndex].dueTime = dueTime;
                state.tasks[taskIndex].updatedAt = new Date().toISOString();

                saveTasks();
                showToast(`Task "${title}" updated`);
            }
        } else {
            // Create new task
            const newTask = {
                id: generateId(),
                title: title,
                text: title, // Legacy sync
                description: description,
                priority: priority,
                category: category,
                dueDate: dueDate,
                dueTime: dueTime,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            state.tasks.unshift(newTask);
            saveTasks();
            showToast(`Task "${title}" created`);
        }

        DOM.saveTaskSubmitBtn.disabled = false;
        closeTaskModal();
        refreshAllViews();
    }

    /**
     * Backward-compatible createTask function.
     */
    function createTask(text, completed) {
        const newTask = {
            id: generateId(),
            title: text,
            text: text,
            description: '',
            priority: 'medium',
            category: 'Personal',
            dueDate: '',
            dueTime: '',
            completed: Boolean(completed),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        state.tasks.unshift(newTask);
        saveTasks();
        refreshAllViews();
        return newTask;
    }

    /**
     * Backward-compatible global addTask function (satisfies legacy script.js tests & inline button).
     */
    function addTask() {
        if (!DOM.taskInput) return;
        const text = DOM.taskInput.value.trim();
        if (!text) {
            if (DOM.titleError) DOM.titleError.hidden = false;
            return;
        }

        createTask(text, false);
        DOM.taskInput.value = '';
    }

    window.createTask = createTask;
    window.addTask = addTask;

    /**
     * Backward-compatible saveTasks function.
     */
    window.saveTasks = saveTasks;

    /**
     * Toggle completion status of a task.
     */
    function toggleTaskCompletion(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();

        saveTasks();
        refreshAllViews();

        const statusMsg = task.completed ? 'completed' : 'reopened';
        showToast(`Task marked as ${statusMsg}`);
    }

    /**
     * Open task creation modal.
     */
    function openCreateTaskModal(prefillDate = null) {
        DOM.taskModalTitle.textContent = 'Create Task';
        DOM.saveTaskSubmitBtn.textContent = 'Save Task';
        DOM.editingTaskId.value = '';
        DOM.taskForm.reset();

        if (DOM.titleError) DOM.titleError.hidden = true;
        if (prefillDate) {
            DOM.taskDueDate.value = prefillDate;
        } else if (state.activeFilter === 'today') {
            DOM.taskDueDate.value = getTodayString();
        }

        DOM.taskModal.hidden = false;
        setTimeout(() => DOM.taskInput.focus(), 50);
    }

    /**
     * Open task edit modal with pre-filled metadata.
     */
    function openEditTaskModal(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;

        DOM.taskModalTitle.textContent = 'Edit Task';
        DOM.saveTaskSubmitBtn.textContent = 'Update Task';
        DOM.editingTaskId.value = task.id;

        DOM.taskInput.value = task.title || '';
        DOM.taskDescription.value = task.description || '';
        DOM.taskPriority.value = task.priority || 'medium';
        DOM.taskCategory.value = task.category || 'Personal';
        DOM.taskDueDate.value = task.dueDate || '';
        DOM.taskDueTime.value = task.dueTime || '';

        if (DOM.titleError) DOM.titleError.hidden = true;

        DOM.taskModal.hidden = false;
        setTimeout(() => DOM.taskInput.focus(), 50);
    }

    function closeTaskModal() {
        DOM.taskModal.hidden = true;
        DOM.editingTaskId.value = '';
        DOM.taskForm.reset();
        if (DOM.titleError) DOM.titleError.hidden = true;
    }

    /**
     * Open delete confirmation dialog.
     */
    function openDeleteConfirmation(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;

        state.deleteTargetId = taskId;
        DOM.confirmDeleteText.textContent = `Are you sure you want to delete "${task.title}"? This action cannot be undone.`;
        DOM.confirmDeleteModal.hidden = false;
        setTimeout(() => DOM.confirmDeleteBtn.focus(), 50);
    }

    function closeDeleteConfirmation() {
        DOM.confirmDeleteModal.hidden = true;
        state.deleteTargetId = null;
    }

    function executeTaskDelete() {
        if (!state.deleteTargetId) return;

        const targetIndex = state.tasks.findIndex(t => t.id === state.deleteTargetId);
        if (targetIndex !== -1) {
            const deleted = state.tasks.splice(targetIndex, 1)[0];
            state.lastDeletedTask = deleted;
            saveTasks();
            refreshAllViews();

            showToast(
                `Task "${deleted.title}" deleted`,
                'danger',
                'Undo',
                function () {
                    if (state.lastDeletedTask) {
                        state.tasks.splice(targetIndex, 0, state.lastDeletedTask);
                        saveTasks();
                        refreshAllViews();
                        showToast(`Restored "${state.lastDeletedTask.title}"`);
                        state.lastDeletedTask = null;
                    }
                }
            );
        }

        closeDeleteConfirmation();
    }

    /**
     * Clear all completed tasks.
     */
    function clearAllCompletedTasks() {
        const completedTasks = state.tasks.filter(t => t.completed);
        if (completedTasks.length === 0) return;

        if (confirm(`Clear ${completedTasks.length} completed task(s)?`)) {
            state.tasks = state.tasks.filter(t => !t.completed);
            saveTasks();
            refreshAllViews();
            showToast(`Cleared ${completedTasks.length} completed task(s)`);
        }
    }

    // =========================================================================
    // View Synchronization & Refresh
    // =========================================================================

    function refreshAllViews() {
        updateDashboardMetrics();
        if (state.activeView === 'list') {
            renderTaskList();
        } else {
            renderCalendar();
        }
    }

    function switchView(viewName) {
        state.activeView = viewName;
        try {
            localStorage.setItem(STORAGE_KEY_VIEW, viewName);
        } catch (e) {}

        if (viewName === 'list') {
            DOM.listViewBtn.classList.add('active');
            DOM.listViewBtn.setAttribute('aria-selected', 'true');
            DOM.calendarViewBtn.classList.remove('active');
            DOM.calendarViewBtn.setAttribute('aria-selected', 'false');

            DOM.listViewContainer.hidden = false;
            DOM.calendarViewContainer.hidden = true;
            renderTaskList();
        } else {
            DOM.calendarViewBtn.classList.add('active');
            DOM.calendarViewBtn.setAttribute('aria-selected', 'true');
            DOM.listViewBtn.classList.remove('active');
            DOM.listViewBtn.setAttribute('aria-selected', 'false');

            DOM.calendarViewContainer.hidden = false;
            DOM.listViewContainer.hidden = true;
            renderCalendar();
        }
    }

    // =========================================================================
    // Event Listeners & Keyboard Bindings
    // =========================================================================

    function bindEvents() {
        // View Toggle Buttons
        if (DOM.listViewBtn) {
            DOM.listViewBtn.addEventListener('click', () => switchView('list'));
        }
        if (DOM.calendarViewBtn) {
            DOM.calendarViewBtn.addEventListener('click', () => switchView('calendar'));
        }

        // Open Create Modal Buttons
        if (DOM.openCreateModalBtn) {
            DOM.openCreateModalBtn.addEventListener('click', () => openCreateTaskModal());
        }
        if (DOM.emptyStateActionBtn) {
            DOM.emptyStateActionBtn.addEventListener('click', () => openCreateTaskModal());
        }
        if (DOM.agendaAddTaskBtn) {
            DOM.agendaAddTaskBtn.addEventListener('click', () => {
                openCreateTaskModal(state.selectedCalendarDay);
            });
        }

        // Modal Form Handling
        if (DOM.taskForm) {
            DOM.taskForm.addEventListener('submit', handleTaskFormSubmit);
        }
        if (DOM.closeTaskModalBtn) {
            DOM.closeTaskModalBtn.addEventListener('click', closeTaskModal);
        }
        if (DOM.cancelTaskModalBtn) {
            DOM.cancelTaskModalBtn.addEventListener('click', closeTaskModal);
        }

        // Delete Confirmation Modal Handling
        if (DOM.confirmDeleteBtn) {
            DOM.confirmDeleteBtn.addEventListener('click', executeTaskDelete);
        }
        if (DOM.cancelDeleteBtn) {
            DOM.cancelDeleteBtn.addEventListener('click', closeDeleteConfirmation);
        }

        // Category Manager Modal Handling
        if (DOM.manageCategoriesBtn) {
            DOM.manageCategoriesBtn.addEventListener('click', () => {
                DOM.categoryModal.hidden = false;
                setTimeout(() => DOM.newCategoryInput.focus(), 50);
            });
        }
        if (DOM.inlineAddCategoryBtn) {
            DOM.inlineAddCategoryBtn.addEventListener('click', () => {
                DOM.categoryModal.hidden = false;
                setTimeout(() => DOM.newCategoryInput.focus(), 50);
            });
        }
        if (DOM.closeCategoryModalBtn) {
            DOM.closeCategoryModalBtn.addEventListener('click', () => {
                DOM.categoryModal.hidden = true;
            });
        }
        if (DOM.doneCategoryBtn) {
            DOM.doneCategoryBtn.addEventListener('click', () => {
                DOM.categoryModal.hidden = true;
            });
        }
        if (DOM.newCategoryForm) {
            DOM.newCategoryForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const success = addCustomCategory(DOM.newCategoryInput.value);
                if (success) {
                    DOM.newCategoryInput.value = '';
                }
            });
        }

        // Clear Completed Tasks
        if (DOM.clearCompletedBtn) {
            DOM.clearCompletedBtn.addEventListener('click', clearAllCompletedTasks);
        }

        // Search Input Handling
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('input', function (e) {
                state.searchQuery = e.target.value;
                if (DOM.clearSearchBtn) {
                    DOM.clearSearchBtn.hidden = state.searchQuery.length === 0;
                }
                renderTaskList();
            });
        }
        if (DOM.clearSearchBtn) {
            DOM.clearSearchBtn.addEventListener('click', function () {
                state.searchQuery = '';
                DOM.searchInput.value = '';
                DOM.clearSearchBtn.hidden = true;
                DOM.searchInput.focus();
                renderTaskList();
            });
        }

        // Status Filter Tabs
        DOM.filterTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                DOM.filterTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                state.activeFilter = tab.getAttribute('data-filter') || 'all';
                renderTaskList();
            });
        });

        // Dropdowns: Category, Priority, Sort
        if (DOM.categoryFilter) {
            DOM.categoryFilter.addEventListener('change', function (e) {
                state.activeCategory = e.target.value;
                renderTaskList();
            });
        }
        if (DOM.priorityFilter) {
            DOM.priorityFilter.addEventListener('change', function (e) {
                state.activePriority = e.target.value;
                renderTaskList();
            });
        }
        if (DOM.sortOrder) {
            DOM.sortOrder.addEventListener('change', function (e) {
                state.sortBy = e.target.value;
                renderTaskList();
            });
        }

        // Reset Filters Button
        if (DOM.resetFiltersBtn) {
            DOM.resetFiltersBtn.addEventListener('click', function () {
                state.activeFilter = 'all';
                state.activeCategory = 'all';
                state.activePriority = 'all';
                state.searchQuery = '';

                if (DOM.searchInput) DOM.searchInput.value = '';
                if (DOM.clearSearchBtn) DOM.clearSearchBtn.hidden = true;
                if (DOM.categoryFilter) DOM.categoryFilter.value = 'all';
                if (DOM.priorityFilter) DOM.priorityFilter.value = 'all';

                DOM.filterTabs.forEach(tab => {
                    const isAll = tab.getAttribute('data-filter') === 'all';
                    tab.classList.toggle('active', isAll);
                    tab.setAttribute('aria-selected', isAll ? 'true' : 'false');
                });

                renderTaskList();
                showToast('Filters reset to default');
            });
        }

        // Calendar Month Navigation
        if (DOM.prevMonthBtn) {
            DOM.prevMonthBtn.addEventListener('click', function () {
                state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
                renderCalendar();
            });
        }
        if (DOM.nextMonthBtn) {
            DOM.nextMonthBtn.addEventListener('click', function () {
                state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
                renderCalendar();
            });
        }
        if (DOM.todayMonthBtn) {
            DOM.todayMonthBtn.addEventListener('click', function () {
                state.calendarDate = new Date();
                state.selectedCalendarDay = getTodayString();
                renderCalendar();
            });
        }

        // Global Keyboard Navigation
        document.addEventListener('keydown', function (e) {
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

            // Escape key closes modals
            if (e.key === 'Escape') {
                if (!DOM.taskModal.hidden) closeTaskModal();
                if (!DOM.confirmDeleteModal.hidden) closeDeleteConfirmation();
                if (!DOM.categoryModal.hidden) DOM.categoryModal.hidden = true;
            }

            // 'N' key opens new task modal (when not typing in an input)
            if ((e.key === 'n' || e.key === 'N') && !isInputFocused && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                openCreateTaskModal();
            }

            // '/' or 'Ctrl+K' focuses search bar
            if ((e.key === '/' && !isInputFocused) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
                e.preventDefault();
                if (DOM.searchInput) {
                    DOM.searchInput.focus();
                    DOM.searchInput.select();
                }
            }
        });

        // Close modals clicking outside dialog
        [DOM.taskModal, DOM.confirmDeleteModal, DOM.categoryModal].forEach(overlay => {
            if (overlay) {
                overlay.addEventListener('click', function (e) {
                    if (e.target === overlay) {
                        if (overlay === DOM.taskModal) closeTaskModal();
                        if (overlay === DOM.confirmDeleteModal) closeDeleteConfirmation();
                        if (overlay === DOM.categoryModal) DOM.categoryModal.hidden = true;
                    }
                });
            }
        });
    }

    // =========================================================================
    // Initialization
    // =========================================================================

    function init() {
        // Set header date
        if (DOM.currentDateDisplay) {
            const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            DOM.currentDateDisplay.textContent = new Date().toLocaleDateString(undefined, options);
        }

        initTheme();
        loadCategories();
        loadTasks();
        renderCategoryOptions();

        // Restore view preference
        try {
            const savedView = localStorage.getItem(STORAGE_KEY_VIEW);
            if (savedView === 'calendar' || savedView === 'list') {
                state.activeView = savedView;
            }
        } catch (e) {}

        bindEvents();
        switchView(state.activeView);
        updateDashboardMetrics();
    }

    // Run initialization on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
