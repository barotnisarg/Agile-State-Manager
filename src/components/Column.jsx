// src/components/Column.jsx
import React from 'react';
import TaskCard from './TaskCard';
import { COLUMN_LABELS, WIP_LIMITS } from '../utils/taskUtils';

// ── WIP progress bar — only renders for columns that have a limit ─────────────
function WipBar({ count, limit }) {
  const pct     = Math.min(count / limit, 1) * 100;
  const isFull  = count >= limit;
  const isOver  = count > limit;   // shouldn't happen but defensive

  return (
    <div className="wip-bar" aria-label={`${count} of ${limit} slots used`}>
      <div className="wip-bar__track">
        {/* filled portion */}
        <div
          className={`wip-bar__fill ${isFull ? 'wip-bar__fill--full' : ''}`}
          style={{ width: `${pct}%` }}
        />
        {/* segment dividers — one per slot */}
        {Array.from({ length: limit - 1 }, (_, i) => (
          <div
            key={i}
            className="wip-bar__segment"
            style={{ left: `${((i + 1) / limit) * 100}%` }}
          />
        ))}
      </div>
      <span className={`wip-bar__label ${isFull ? 'wip-bar__label--full' : ''}`}>
        {isFull ? (isOver ? 'Over limit' : 'Full') : `${limit - count} slot${limit - count !== 1 ? 's' : ''} free`}
      </span>
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

      {/* WIP bar — only shown for columns with a defined limit */}
      {limit && <WipBar count={count} limit={limit} />}

      <div className="column__cards">
        {tasks.length === 0 && (
          <p className="column__empty">Drop tasks here</p>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onAdvance={onAdvance}
            onEdit={onEdit}
            onDelete={onDelete}
            dragProps={getDragProps(task.id)}
          />
        ))}
      </div>
    </div>
  );
}