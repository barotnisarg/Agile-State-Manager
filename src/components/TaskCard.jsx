// src/components/TaskCard.jsx
import React, { useState, useEffect } from 'react';
import { TRANSITIONS, COLUMN_LABELS, PRIORITIES, DEFAULT_PRIORITY, timeAgo } from '../utils/taskUtils';

// Extract #hashtag words from title or description as tag chips
function extractTags(text = '') {
  const matches = text.match(/#[a-zA-Z0-9_]+/g) ?? [];
  return [...new Set(matches)]; // dedupe
}

export default function TaskCard({ task, onAdvance, onEdit, onDelete, dragProps }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const nextColumn    = TRANSITIONS[task.column];
  const priorityMeta  = PRIORITIES.find((p) => p.value === (task.priority ?? DEFAULT_PRIORITY));
  const tags          = extractTags(`${task.title} ${task.description ?? ''}`);
  // Strip #tags from the displayed title so they don't appear twice
  const displayTitle  = task.title.replace(/#[a-zA-Z0-9_]+/g, '').trim();

  return (
    <div
      className={`task-card ${task.column === 'blocked' ? 'task-card--blocked' : ''}`}
      style={{ '--p-color': priorityMeta.color, touchAction: 'none' }}
      {...(dragProps ?? {})}
    >
      {/* Left priority color bar */}
      <div className="task-card__color-bar" aria-hidden="true" />

      <div className="task-card__body">

        {/* ── Header: title + action buttons ── */}
        <div className="task-card__header">
          <span className="task-card__title">{displayTitle}</span>
          <div className="task-card__actions">
            <button className="icon-btn" title="Edit task" onClick={() => onEdit(task)} aria-label="Edit task">
              ✏️
            </button>
            {confirmDelete ? (
              <>
                <button className="icon-btn icon-btn--danger" onClick={() => onDelete(task.id)} title="Confirm delete">✓</button>
                <button className="icon-btn" onClick={() => setConfirmDelete(false)} title="Cancel">✕</button>
              </>
            ) : (
              <button className="icon-btn" title="Delete task" onClick={() => setConfirmDelete(true)} aria-label="Delete task">
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* ── Description ── */}
        {task.description && (
          <p className="task-card__desc">
            {task.description.replace(/#[a-zA-Z0-9_]+/g, '').trim()}
          </p>
        )}

        {/* ── Tag chips + priority badge row ── */}
        <div className="task-card__chips">
          <span className="priority-badge">
            <span className="priority-badge__dot" />
            {priorityMeta.label}
          </span>
          {tags.map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>

        {/* ── Blocked reason ── */}
        {task.blockedReason && (
          <p className="task-card__blocked-reason">⚠ {task.blockedReason}</p>
        )}

        {/* ── Footer: timestamps + advance button ── */}
        <div className="task-card__footer">
          <div className="task-card__timestamps">
            <span title={new Date(task.createdAt).toLocaleString()}>
              {timeAgo(task.createdAt)}
            </span>
            {task.movedAt && task.movedAt !== task.createdAt && (
              <span title={new Date(task.movedAt).toLocaleString()}>
                · moved {timeAgo(task.movedAt)}
              </span>
            )}
          </div>
          {nextColumn && (
            <button className="task-card__advance" onClick={() => onAdvance(task.id)}>
              {COLUMN_LABELS[nextColumn]} →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}