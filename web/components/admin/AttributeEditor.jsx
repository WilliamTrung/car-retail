"use client";

import { useMemo, useState } from "react";
import styles from "./AttributeEditor.module.css";

/** @param {unknown[]} list @param {number} from @param {number} to */
function reorderList(list, from, to) {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** @param {unknown} value */
function normalizeValue(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return String(value);
  return String(value);
}

/**
 * @param {{
 *   name?: string,
 *   value?: { key?: string, value?: unknown, unit?: string | null }[],
 *   attributeKeys?: { key: string, groupKey?: string | null }[],
 *   units?: { key: string }[],
 *   specLabels?: Record<string, string>,
 * }} props
 */
export default function AttributeEditor({
  name = "attributes",
  value = [],
  attributeKeys = [],
  units = [],
  specLabels = {},
}) {
  const initial = useMemo(
    () =>
      Array.isArray(value)
        ? value.map((item) => ({
            key: item?.key ?? "",
            value: normalizeValue(item?.value),
            unit: item?.unit ?? "",
          }))
        : [],
    [value]
  );

  const [items, setItems] = useState(initial);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const keyOptions = useMemo(() => {
    const fromCatalog = attributeKeys.map((item) => item.key);
    const fromRows = items.map((item) => item.key).filter(Boolean);
    return [...new Set([...fromCatalog, ...fromRows])].sort();
  });

  const serialized = useMemo(
    () =>
      JSON.stringify(
        items
          .filter((item) => item.key.trim())
          .map((item) => {
            const raw = item.value.trim();
            const asNumber = raw !== "" && !Number.isNaN(Number(raw)) ? Number(raw) : raw;
            return {
              key: item.key.trim(),
              value: asNumber,
              unit: item.unit || null,
            };
          })
      ),
    [items]
  );

  function updateRow(index, patch) {
    setItems((current) => current.map((row, idx) => (idx === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setItems((current) => [...current, { key: "", value: "", unit: "" }]);
  }

  function removeRow(index) {
    setItems((current) => current.filter((_, idx) => idx !== index));
  }

  function finishDrag(toIndex) {
    if (dragIndex === null) return;
    setItems((current) => reorderList(current, dragIndex, toIndex));
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className={styles.root}>
      <input type="hidden" name={name} value={serialized} readOnly />
      <p className={styles.heading}>Attributes</p>
      <p className={styles.hint}>Drag rows to set display order. Order is saved top to bottom.</p>

      {items.length === 0 ? (
        <p className={styles.empty}>Chưa có thông số. Thêm bản ghi đầu tiên bên dưới.</p>
      ) : (
        <div className={styles.list}>
          {items.map((row, index) => {
            const label = specLabels[row.key] || row.key || "Thông số mới";
            const isDragging = dragIndex === index;
            const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;

            return (
              <div
                key={`attr-${index}`}
                className={`${styles.row} ${styles.rowModel} ${isDragging ? styles.rowDragging : ""} ${isOver ? styles.rowOver : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIndex(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  finishDrag(index);
                }}
                onDragLeave={() => {
                  if (overIndex === index) setOverIndex(null);
                }}
              >
                <button
                  type="button"
                  className={styles.dragHandle}
                  draggable
                  aria-label={`Reorder ${label}`}
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                >
                  ⋮⋮
                </button>

                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label htmlFor={`${name}-key-${index}`}>Key</label>
                  <input
                    id={`${name}-key-${index}`}
                    list={`${name}-keys`}
                    value={row.key}
                    placeholder="range"
                    onChange={(e) => updateRow(index, { key: e.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor={`${name}-value-${index}`}>Value</label>
                  <input
                    id={`${name}-value-${index}`}
                    value={row.value}
                    placeholder="450"
                    onChange={(e) => updateRow(index, { value: e.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor={`${name}-unit-${index}`}>Unit</label>
                  <select
                    id={`${name}-unit-${index}`}
                    value={row.unit}
                    onChange={(e) => updateRow(index, { unit: e.target.value })}
                  >
                    <option value="">—</option>
                    {units.map((unit) => (
                      <option key={unit.key} value={unit.key}>
                        {unit.key}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label={`Xóa ${label}`}
                  onClick={() => removeRow(index)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <datalist id={`${name}-keys`}>
        {keyOptions.map((key) => (
          <option key={key} value={key}>
            {specLabels[key] ? `${key} (${specLabels[key]})` : key}
          </option>
        ))}
      </datalist>

      <button type="button" className={styles.addBtn} onClick={addRow}>
        + Thêm thông số
      </button>
    </div>
  );
}
