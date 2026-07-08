// src/components/Column.jsx
import React from 'react';
import TaskCard from './TaskCard';
import { COLUMN_LABELS, WIP_LIMITS } from '../utils/taskUtils';

export default function Column({ columnId, tasks, onAdvance, onEdit, onDelete, isDragOver, columnRef, getDragProps }) {
  const limit = WIP_LIMITS[columnId];
  const count = tasks.length;

  return (
    <div
      ref={columnRef}
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