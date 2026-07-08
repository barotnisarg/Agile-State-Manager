// src/hooks/useDrag.js
import { useRef, useState, useCallback } from 'react';

/**
 * useDrag — pointer-event based drag-and-drop, works on mouse AND touch.
 *
 * Returns:
 *   columnRefs   — { [columnId]: ref }  attach as ref={columnRefs[colId]} on each column div
 *   dragOverCol  — string|null           which column is currently hovered
 *   getDragProps — (taskId) => { onPointerDown }   spread onto each card div
 *
 * When the pointer is released over a column, onDrop(taskId, columnId) fires.
 */
export function useDrag(columnIds, onDrop) {
  // Single ref holding a map of { [columnId]: DOM element }
  // Avoids calling useRef inside a loop (Rules of Hooks violation)
  const colEls = useRef({});

  // Stable callback that columns call to register their DOM node
  const setColumnRef = useCallback((colId) => (el) => {
    colEls.current[colId] = el;
  }, []);

  // Which column the ghost is currently hovering
  const [dragOverCol, setDragOverCol] = useState(null);

  // Mutable drag state — kept outside React state so it never triggers re-renders
  const drag = useRef(null);

  const getDragProps = useCallback(
    (taskId) => ({
      onPointerDown(e) {
        // Only primary button (left click) or first touch point
        if (e.button !== undefined && e.button !== 0) return;
        // Don't start a drag on interactive children (buttons, inputs)
        if (e.target.closest('button, input, textarea, select')) return;

        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();

        // ── Build ghost ────────────────────────────────────────────────────
        const ghost = card.cloneNode(true);
        ghost.style.cssText = `
          position: fixed;
          left: ${rect.left}px;
          top: ${rect.top}px;
          width: ${rect.width}px;
          pointer-events: none;
          opacity: 0.85;
          z-index: 9999;
          transform: rotate(2deg) scale(1.03);
          transition: transform 0.1s ease;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        `;
        ghost.setAttribute('aria-hidden', 'true');
        document.body.appendChild(ghost);

        // Offset within the card where the pointer hit
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        drag.current = { taskId, ghost, offsetX, offsetY };

        // Dim the original card while dragging
        card.classList.add('task-card--dragging');

        // Capture all pointer events to this element
        card.setPointerCapture(e.pointerId);

        // ── pointermove ────────────────────────────────────────────────────
        function onPointerMove(ev) {
          if (!drag.current) return;
          const x = ev.clientX - drag.current.offsetX;
          const y = ev.clientY - drag.current.offsetY;
          drag.current.ghost.style.left = `${x}px`;
          drag.current.ghost.style.top  = `${y}px`;

          // Hit-test every column rect
          let hit = null;
          for (const colId of columnIds) {
            const el = colEls.current[colId];
            if (!el) continue;
            const r = el.getBoundingClientRect();
            if (ev.clientX >= r.left && ev.clientX <= r.right &&
                ev.clientY >= r.top  && ev.clientY <= r.bottom) {
              hit = colId;
              break;
            }
          }
          setDragOverCol(hit);
        }

        // ── pointerup / pointercancel ──────────────────────────────────────
        function onPointerUp(ev) {
          cleanup(ev.currentTarget);

          if (drag.current) {
            const { taskId: id } = drag.current;
            // Find which column the pointer landed on
            let target = null;
            for (const colId of columnIds) {
              const el = colEls.current[colId];
              if (!el) continue;
              const r = el.getBoundingClientRect();
              if (ev.clientX >= r.left && ev.clientX <= r.right &&
                  ev.clientY >= r.top  && ev.clientY <= r.bottom) {
                target = colId;
                break;
              }
            }
            if (target) onDrop(id, target);
          }

          drag.current = null;
          setDragOverCol(null);
        }

        function cleanup(el) {
          el.removeEventListener('pointermove', onPointerMove);
          el.removeEventListener('pointerup', onPointerUp);
          el.removeEventListener('pointercancel', onPointerCancel);
          el.classList.remove('task-card--dragging');
          drag.current?.ghost?.remove();
        }

        function onPointerCancel(ev) {
          cleanup(ev.currentTarget);
          drag.current = null;
          setDragOverCol(null);
        }

        card.addEventListener('pointermove', onPointerMove);
        card.addEventListener('pointerup', onPointerUp);
        card.addEventListener('pointercancel', onPointerCancel);
      },
    }),
    [columnIds, onDrop]
  );

  return { setColumnRef, dragOverCol, getDragProps };
}