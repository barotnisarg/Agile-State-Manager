import React, { useState, useEffect, useRef } from 'react';
import { PRIORITIES, DEFAULT_PRIORITY } from '../utils/taskUtils';

// task prop = null  → "Add" mode
// task prop = {...} → "Edit" mode
export default function TaskModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState(task?.priority ?? DEFAULT_PRIORITY);
  const titleRef = useRef(null);
  const isEdit = Boolean(task);

  // Focus the title input when the modal opens
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title, description, priority);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit task' : 'Add task'}>
        <h2>{isEdit ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={titleRef}
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="priority-selector">
            <span className="priority-selector__label">Priority</span>
            <div className="priority-selector__options">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`priority-option ${priority === p.value ? 'priority-option--active' : ''}`}
                  style={{ '--p-color': p.color }}
                  onClick={() => setPriority(p.value)}
                  aria-pressed={priority === p.value}
                >
                  <span className="priority-option__dot" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              {isEdit ? 'Save changes' : 'Add task'}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}