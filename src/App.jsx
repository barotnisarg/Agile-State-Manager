// src/App.jsx
import React, { useState, useCallback } from 'react';
import { useTasks } from './hooks/useTasks';
import { useDrag } from './hooks/useDrag';
import { COLUMNS, PRIORITIES } from './utils/taskUtils';
import Column from './components/Column';
import TaskModal from './components/TaskModal';
import Toast from './components/Toast';

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ tasks }) {
  const total      = tasks.length;
  const inProgress = tasks.filter((t) => t.column === 'inProgress').length;
  const inReview   = tasks.filter((t) => t.column === 'inReview').length;
  const blocked    = tasks.filter((t) => t.column === 'blocked').length;
  const done       = tasks.filter((t) => t.column === 'done').length;
  const pct        = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="stats-bar" aria-label="Board statistics">
      <div className="stats-bar__stat">
        <span className="stats-bar__value">{total}</span>
        <span className="stats-bar__label">Total</span>
      </div>
      <div className="stats-bar__divider" />
      <div className="stats-bar__stat">
        <span className="stats-bar__value stats-bar__value--accent">{inProgress}</span>
        <span className="stats-bar__label">In Progress</span>
      </div>
      <div className="stats-bar__divider" />
      <div className="stats-bar__stat">
        <span className="stats-bar__value stats-bar__value--warn">{inReview}</span>
        <span className="stats-bar__label">In Review</span>
      </div>
      <div className="stats-bar__divider" />
      <div className="stats-bar__stat">
        <span className="stats-bar__value stats-bar__value--danger">{blocked}</span>
        <span className="stats-bar__label">Blocked</span>
      </div>
      <div className="stats-bar__divider" />
      <div className="stats-bar__stat">
        <span className="stats-bar__value stats-bar__value--success">{done}</span>
        <span className="stats-bar__label">Done</span>
      </div>
      <div className="stats-bar__divider" />
      <div className="stats-bar__completion">
        <div className="stats-bar__completion-header">
          <span className="stats-bar__label">Completion</span>
          <span className="stats-bar__value stats-bar__value--success">{pct}%</span>
        </div>
        <div className="stats-bar__progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="stats-bar__progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { tasks, toast, addTask, editTask, deleteTask, advanceTask, dropTask } = useTasks();
  const { setColumnRef, dragOverCol, getDragProps } = useDrag(COLUMNS, dropTask);

  // modal state: null = closed | 'add' = adding | task object = editing
  const [modalState, setModalState] = useState(null);

  // search & filter state
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState(null); // null = all

  const openAddModal = () => setModalState('add');
  const openEditModal = useCallback((task) => setModalState(task), []);
  const closeModal = () => setModalState(null);

  function handleSave(title, description, priority) {
    if (modalState === 'add') {
      addTask(title, description, priority);
    } else {
      editTask(modalState.id, title, description, priority);
    }
  }

  function togglePriorityFilter(value) {
    setPriorityFilter((prev) => (prev === value ? null : value));
  }

  // Derive filtered tasks — pure, no side effects
  const filteredTasks = tasks.filter((t) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q));
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    return matchesQuery && matchesPriority;
  });

  const isFiltering = query.trim() !== '' || priorityFilter !== null;

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="navbar__title">Agile State Manager</h1>

        <div className="navbar__search-area">
          {/* Search input */}
          <div className="search-wrap">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search tasks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tasks"
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">✕</button>
            )}
          </div>

          {/* Priority filter pills */}
          <div className="filter-pills">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                className={`filter-pill ${priorityFilter === p.value ? 'filter-pill--active' : ''}`}
                style={{ '--p-color': p.color }}
                onClick={() => togglePriorityFilter(p.value)}
                aria-pressed={priorityFilter === p.value}
              >
                <span className="filter-pill__dot" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={openAddModal}>
          + Add Task
        </button>
      </nav>

      {/* Stats dashboard — always visible, reflects all tasks (not filtered) */}
      <StatsBar tasks={tasks} />

      {/* Result count when filtering */}
      {isFiltering && (
        <div className="filter-status">
          Showing {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          <button className="filter-status__clear" onClick={() => { setQuery(''); setPriorityFilter(null); }}>
            Clear filters
          </button>
        </div>
      )}

      <main className="board">
        {COLUMNS.map((colId) => (
          <Column
            key={colId}
            columnId={colId}
            tasks={filteredTasks.filter((t) => t.column === colId)}
            onAdvance={advanceTask}
            onEdit={openEditModal}
            onDelete={deleteTask}
            columnRef={setColumnRef(colId)}
            isDragOver={dragOverCol === colId}
            getDragProps={getDragProps}
          />
        ))}
      </main>

      {modalState !== null && (
        <TaskModal
          task={modalState === 'add' ? null : modalState}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}