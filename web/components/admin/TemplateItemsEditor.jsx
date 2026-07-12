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

/**
 * @param {{
 *   name?: string,
 *   value?: { key?: string, unit?: string, defaultValue?: unknown, showInStrip?: boolean, groupKey?: string | null, sortOrder?: number }[],
 *   attributeKeys?: { key: string, groupKey?: string | null }[],
 *   units?: { key: string }[],
 *   specLabels?: Record<string, string>,
 * }} props
 */
export default function TemplateItemsEditor({
  name = "items",
  value = [],
  attributeKeys = [],
  units = [],
  specLabels = {},
}) {
  const initial = useMemo(
    () =>
      Array.isArray(value)
        ? [...value]
            .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
            .map((item) => ({
              key: item?.key ?? "",
              unit: item?.unit ?? "",
              defaultValue:
                item?.defaultValue === null || item?.defaultValue === undefined
                  ? ""
                  : String(item.defaultValue),
              showInStrip: Boolean(item?.showInStrip),
              groupKey: item?.groupKey ?? "",
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
  }, [attributeKeys, items]);

  const groupOptions = useMemo(() => {
    const fromCatalog = attributeKeys.map((item) => item.groupKey).filter(Boolean);
    const fromRows = items.map((item) => item.groupKey).filter(Boolean);
    return [...new Set([...fromCatalog, ...fromRows])].sort();
  }, [attributeKeys, items]);

  const serialized = useMemo(
    () =>
      JSON.stringify(
        items
          .filter((item) => item.key.trim())
          .map((item, index) => {
            const raw = item.defaultValue.trim();
            const defaultValue = raw !== "" && !Number.isNaN(Number(raw)) ? Number(raw) : raw;
            return {
              key: item.key.trim(),
              unit: item.unit || null,
              defaultValue,
              showInStrip: item.showInStrip,
              groupKey: item.groupKey.trim() || null,
              sortOrder: index + 1,
            };
          })
      ),
    [items]
  );

  function updateRow(index, patch) {
    setItems((current) => current.map((row, idx) => (idx === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setItems((current) => [
      ...current,
      { key: "", unit: "", defaultValue: "", showInStrip: false, groupKey: "" },
    ]);
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
      <p className={styles.heading}>Template items</p>
      <p className={styles.hint}>Drag rows to set sort order. Sort order is saved from top to bottom.</p>

      {items.length === 0 ? (
        <p className={styles.empty}>No template items yet. Add the first record below.</p>
      ) : (
        <div className={styles.list}>
          {items.map((row, index) => {
            const label = specLabels[row.key] || row.key || "New item";
            const isDragging = dragIndex === index;
            const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;

            return (
              <div
                key={`tpl-${index}`}
                className={`${styles.row} ${styles.rowTemplate} ${isDragging ? styles.rowDragging : ""} ${isOver ? styles.rowOver : ""}`}
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
                  <label htmlFor={`${name}-default-${index}`}>Default value</label>
                  <input
                    id={`${name}-default-${index}`}
                    value={row.defaultValue}
                    placeholder="450"
                    onChange={(e) => updateRow(index, { defaultValue: e.target.value })}
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

                <div className={styles.field}>
                  <label htmlFor={`${name}-group-${index}`}>Group</label>
                  <input
                    id={`${name}-group-${index}`}
                    list={`${name}-groups`}
                    value={row.groupKey}
                    placeholder="performance"
                    onChange={(e) => updateRow(index, { groupKey: e.target.value })}
                  />
                </div>

                <label className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    checked={row.showInStrip}
                    onChange={(e) => updateRow(index, { showInStrip: e.target.checked })}
                  />
                  Spec strip
                </label>

                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label={`Remove ${label}`}
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

      <datalist id={`${name}-groups`}>
        {groupOptions.map((group) => (
          <option key={group} value={group} />
        ))}
      </datalist>

      <button type="button" className={styles.addBtn} onClick={addRow}>
        + Add item
      </button>
    </div>
  );
}
