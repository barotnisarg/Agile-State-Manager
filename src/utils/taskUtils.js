// ─── Column order & display names ────────────────────────────────────────────
export const COLUMNS = ['backlog', 'inProgress', 'inReview', 'done', 'blocked'];

export const COLUMN_LABELS = {
  backlog: 'Backlog',
  inProgress: 'In Progress',
  inReview: 'In Review',
  done: 'Done',
  blocked: 'Blocked',
};

// ─── WIP limits ──────────────────────────────────────────────────────────────
export const WIP_LIMITS = {
  inProgress: 3,
  inReview: 2,
};

// ─── Valid forward transitions ────────────────────────────────────────────────
// Maps: current column → allowed destination column
export const TRANSITIONS = {
  backlog: 'inProgress',
  inProgress: 'inReview',
  inReview: 'done',
  done: null,       // terminal state
  blocked: null,    // managed by auto-unblock only
};

// ─── Priority levels ──────────────────────────────────────────────────────────
export const PRIORITIES = [
  { value: 'low',      label: 'Low',      color: '#3fb950' },  // green
  { value: 'medium',   label: 'Medium',   color: '#d29922' },  // amber
  { value: 'high',     label: 'High',     color: '#f0883e' },  // orange
  { value: 'critical', label: 'Critical', color: '#f85149' },  // red
];

export const DEFAULT_PRIORITY = 'medium';

// ─── Generate a unique ID ─────────────────────────────────────────────────────
export const generateId = () =>
  `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── Relative time helper ─────────────────────────────────────────────────────
// Returns a human-readable string like "just now", "5m ago", "2h ago", "3d ago"
export function timeAgo(timestamp) {
  if (!timestamp) return null;
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10)  return 'just now';
  if (seconds < 60)  return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)  return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)     return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12)   return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ─── Try to move a task; returns { tasks, message } ──────────────────────────
// Enforces WIP limits and auto-blocking. Pure function — no side effects.
export function moveTask(tasks, taskId, targetColumn) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return { tasks, message: null };

  const currentColumn = task.column;
  const allowedNext = TRANSITIONS[currentColumn];

  // Can only move forward in the defined order
  if (targetColumn !== allowedNext) {
    return { tasks, message: null };
  }

  const limit = WIP_LIMITS[targetColumn];
  const currentCount = tasks.filter((t) => t.column === targetColumn).length;

  if (limit && currentCount >= limit) {
    // WIP full — block the task instead
    const blockedTasks = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            column: 'blocked',
            blockedFrom: targetColumn,
            blockedReason: `${COLUMN_LABELS[targetColumn]} is full (${limit}/${limit})`,
            movedAt: Date.now(),
          }
        : t
    );
    return {
      tasks: blockedTasks,
      message: `"${task.title}" blocked — ${COLUMN_LABELS[targetColumn]} is full.`,
    };
  }

  // Move succeeds
  const movedTasks = tasks.map((t) =>
    t.id === taskId
      ? { ...t, column: targetColumn, blockedFrom: null, blockedReason: null, movedAt: Date.now() }
      : t
  );

  // Auto-unblock: after freeing a spot, check blocked tasks that were waiting
  const unblocked = autoUnblock(movedTasks);
  return { tasks: unblocked.tasks, message: unblocked.message };
}

// ─── Auto-unblock logic ───────────────────────────────────────────────────────
// Called after any move that might free a WIP slot.
function autoUnblock(tasks) {
  let current = [...tasks];
  let messages = [];

  for (const [col, limit] of Object.entries(WIP_LIMITS)) {
    const count = current.filter((t) => t.column === col).length;
    if (count >= limit) continue;

    const waiting = current.filter((t) => t.column === 'blocked' && t.blockedFrom === col);
    if (waiting.length === 0) continue;

    // Move the first waiting task in
    const taskToUnblock = waiting[0];
    current = current.map((t) =>
      t.id === taskToUnblock.id
        ? { ...t, column: col, blockedFrom: null, blockedReason: null, movedAt: Date.now() }
        : t
    );
    messages.push(`"${taskToUnblock.title}" auto-moved to ${COLUMN_LABELS[col]}.`);
  }

  return { tasks: current, message: messages.join(' ') || null };
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const STORAGE_KEY = 'agile-tasks';

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // localStorage unavailable — silently skip
  }
}