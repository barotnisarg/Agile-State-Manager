// src/components/Column.jsx
import React from 'react';
import TaskCard from './TaskCard';
import { COLUMN_LABELS, WIP_LIMITS } from '../utils/taskUtils';

// ── Per-column empty state config ─────────────────────────────────────────────
const EMPTY_STATES = {
  backlog: {
    label: 'Nothing queued yet',
    hint:  'Add a task to get started',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {/* inbox tray */}
        <rect x="6" y="28" width="36" height="14" rx="4"
          stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.5"/>
        <path d="M6 34h8l3 4h14l3-4h8"
          stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
        {/* down arrow */}
        <line x1="24" y1="6" x2="24" y2="24"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <polyline points="17,18 24,26 31,18"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
  inProgress: {
    label: 'No active work',
    hint:  'Drag a task from Backlog to start',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {/* spinning gear outline */}
        <circle cx="24" cy="24" r="7"
          stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <circle cx="24" cy="24" r="2.5" fill="currentColor" opacity="0.6"/>
        {/* gear teeth */}
        {[0,45,90,135,180,225,270,315].map((deg, i) => {
          const r = Math.PI * deg / 180;
          const x1 = 24 + 10 * Math.cos(r);
          const y1 = 24 + 10 * Math.sin(r);
          const x2 = 24 + 14 * Math.cos(r);
          const y2 = 24 + 14 * Math.sin(r);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>;
        })}
      </svg>
    ),
  },
  inReview: {
    label: 'Nothing to review',
    hint:  'Move tasks here when ready for review',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {/* magnifying glass */}
        <circle cx="21" cy="21" r="11"
          stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <line x1="29" y1="30" x2="40" y2="41"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        {/* lines inside = document being reviewed */}
        <line x1="16" y1="19" x2="26" y2="19"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="16" y1="23" x2="23" y2="23"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
  },
  done: {
    label: 'No completed tasks',
    hint:  'Finished tasks will appear here',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {/* circle */}
        <circle cx="24" cy="24" r="16"
          stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.5"/>
        {/* big checkmark */}
        <path d="M15 24 L21 30 L33 18"
          stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
  blocked: {
    label: 'Nothing blocked',
    hint:  'Tasks that hit WIP limits land here',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {/* shield */}
        <path d="M24 6 L38 12 L38 26 C38 34 24 42 24 42 C24 42 10 34 10 26 L10 12 Z"
          stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.55"/>
        {/* exclamation */}
        <line x1="24" y1="18" x2="24" y2="28"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="24" cy="33" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
};

// ── WIP progress bar — only renders for columns that have a limit ─────────────
function WipBar({ count, limit }) {
  const pct    = Math.min(count / limit, 1) * 100;
  const isFull = count >= limit;
  const isOver = count > limit;

  return (
    <div className="wip-bar" aria-label={`${count} of ${limit} slots used`}>
      <div className="wip-bar__track">
        <div className={`wip-bar__fill ${isFull ? 'wip-bar__fill--full' : ''}`}
          style={{ width: `${pct}%` }} />
        {Array.from({ length: limit - 1 }, (_, i) => (
          <div key={i} className="wip-bar__segment"
            style={{ left: `${((i + 1) / limit) * 100}%` }} />
        ))}
      </div>
      <span className={`wip-bar__label ${isFull ? 'wip-bar__label--full' : ''}`}>
        {isFull ? (isOver ? 'Over limit' : 'Full') : `${limit - count} slot${limit - count !== 1 ? 's' : ''} free`}
      </span>
    </div>
  );
}

// ── Empty state illustration ──────────────────────────────────────────────────
function EmptyState({ columnId, isDragOver }) {
  const { label, hint, icon } = EMPTY_STATES[columnId] ?? EMPTY_STATES.backlog;
  return (
    <div className={`column__empty ${isDragOver ? 'column__empty--drag-over' : ''}`}
      aria-label={`${label} — ${hint}`}>
      <div className="column__empty-icon">{icon}</div>
      <span className="column__empty-label">{label}</span>
      <span className="column__empty-hint">{hint}</span>
      {isDragOver && (
        <span className="column__empty-drop-cue">Release to drop ↓</span>
      )}
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────
export default function Column({ columnId, tasks, onAdvance, onEdit, onDelete, isDragOver, columnRef, getDragProps }) {
  const limit = WIP_LIMITS[columnId];
  const count = tasks.length;

  return (
    <div
      ref={columnRef}
      data-column={columnId}
      className={`column ${isDragOver ? 'column--drag-over' : ''}`}
    >
      <div className="column__header">
        <h2 className="column__title">{COLUMN_LABELS[columnId]}</h2>
        <div className="column__meta">
          <span className={`column__count ${limit && count >= limit ? 'column__count--full' : ''}`}>
            {count}{limit ? `/${limit}` : ''}
          </span>
        </div>
      </div>

      {limit && <WipBar count={count} limit={limit} />}

      <div className="column__cards">
        {tasks.length === 0
          ? <EmptyState columnId={columnId} isDragOver={isDragOver} />
          : tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onAdvance={onAdvance}
                onEdit={onEdit}
                onDelete={onDelete}
                dragProps={getDragProps(task.id)}
              />
            ))
        }
      </div>
    </div>
  );
}