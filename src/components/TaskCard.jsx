// src/components/TaskCard.jsx
import React, { useState, useEffect } from 'react';
import {
  TRANSITIONS,
  COLUMN_LABELS,
  PRIORITIES,
  DEFAULT_PRIORITY,
  timeAgo,
} from '../utils/taskUtils';

export default function TaskCard({
  task,
  onAdvance,
  onEdit,
  onDelete,
  dragProps,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Tick every 30s so relative timestamps stay fresh
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const nextColumn = TRANSITIONS[task.column];
  const priorityMeta =
    PRIORITIES.find(
      (p) => p.value === (task.priority ?? DEFAULT_PRIORITY)
    ) || PRIORITIES[0];

  return (
    <div
      className={`task-card ${
        task.column === 'blocked' ? 'task-card--blocked' : ''
      }`}
      style={{ touchAction: 'none' }}
      {...(dragProps ?? {})}
    >
      <div className="task-card__header">
        <span className="task-card__title">{task.title}</span>

        <div className="task-card__actions">
          <button
            className="icon-btn"
            title="Edit task"
            aria-label="Edit task"
            onClick={() => onEdit(task)}
          >
            ✏️
          </button>

          {confirmDelete ? (
            <>
              <button
                className="icon-btn icon-btn--danger"
                title="Confirm delete"
                onClick={() => onDelete(task.id)}
              >
                ✓
              </button>

              <button
                className="icon-btn"
                title="Cancel"
                onClick={() => setConfirmDelete(false)}
              >
                ✕
              </button>
            </>
          ) : (
            <button
              className="icon-btn"
              title="Delete task"
              aria-label="Delete task"
              onClick={() => setConfirmDelete(true)}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <span
        className="priority-badge"
        style={{ "--p-color": priorityMeta.color }}
      >
        <span className="priority-badge__dot" />
        {priorityMeta.label}
      </span>

      {task.description && (
        <p className="task-card__desc">{task.description}</p>
      )}

      {task.blockedReason && (
        <p className="task-card__blocked-reason">
          {task.blockedReason}
        </p>
      )}

      <div className="task-card__timestamps">
        <span title={new Date(task.createdAt).toLocaleString()}>
          Created {timeAgo(task.createdAt)}
        </span>

        {task.movedAt && task.movedAt !== task.createdAt && (
          <span title={new Date(task.movedAt).toLocaleString()}>
            {" · "}Moved {timeAgo(task.movedAt)}
          </span>
        )}
      </div>

      {nextColumn && (
        <button
          className="task-card__advance"
          onClick={() => onAdvance(task.id)}
        >
          Move to {COLUMN_LABELS[nextColumn]} →
        </button>
      )}
    </div>
  );
}