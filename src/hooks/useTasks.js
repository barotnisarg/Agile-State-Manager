import { useState, useEffect, useCallback } from 'react';
import {
  loadTasks,
  saveTasks,
  generateId,
  moveTask,
  TRANSITIONS,
  DEFAULT_PRIORITY,
} from '../utils/taskUtils';

export function useTasks() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [toast, setToast] = useState(null);

  // Persist to localStorage whenever tasks change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Auto-clear toast after 3 s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Add a brand-new task (always goes to Backlog)
  const addTask = useCallback((title, description, priority = DEFAULT_PRIORITY) => {
    const now = Date.now();
    const newTask = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      priority,
      column: 'backlog',
      blockedFrom: null,
      blockedReason: null,
      createdAt: now,
      movedAt: now,
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  // Edit an existing task's title, description, and priority
  const editTask = useCallback((taskId, title, description, priority = DEFAULT_PRIORITY) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, title: title.trim(), description: description.trim(), priority }
          : t
      )
    );
  }, []);

  // Delete a task
  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  // Advance a task to the next column (with WIP + blocking logic)
  const advanceTask = useCallback((taskId) => {
    setTasks((prev) => {
      const { tasks: next, message } = moveTask(prev, taskId,
        TRANSITIONS[prev.find((t) => t.id === taskId)?.column]);
      if (message) setToast(message);
      return next;
    });
  }, []);

  // Drag-and-drop drop handler
  const dropTask = useCallback((taskId, targetColumn) => {
    setTasks((prev) => {
      const { tasks: next, message } = moveTask(prev, taskId, targetColumn);
      if (message) setToast(message);
      return next;
    });
  }, []);

  return { tasks, toast, addTask, editTask, deleteTask, advanceTask, dropTask };
}