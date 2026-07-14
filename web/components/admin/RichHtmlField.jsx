"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RichHtmlField.module.css";

const TOOLBAR = [
  { cmd: "bold", label: "B", title: "Đậm" },
  { cmd: "italic", label: "I", title: "Nghiêng" },
  { cmd: "underline", label: "U", title: "Gạch chân" },
  { cmd: "h2", label: "H2", title: "Tiêu đề H2" },
  { cmd: "h3", label: "H3", title: "Tiêu đề H3" },
  { cmd: "ul", label: "•", title: "Danh sách" },
  { cmd: "ol", label: "1.", title: "Danh sách số" },
  { cmd: "link", label: "🔗", title: "Liên kết" },
  { cmd: "p", label: "¶", title: "Đoạn văn" },
];

/**
 * @param {{ name: string, label: string, defaultValue?: string }} props
 */
export default function RichHtmlField({ name, label, defaultValue = "" }) {
  const editorRef = useRef(null);
  const [html, setHtml] = useState(defaultValue || "");
  const [mode, setMode] = useState("visual");

  useEffect(() => {
    if (editorRef.current && mode === "visual") {
      editorRef.current.innerHTML = defaultValue || "";
    }
  }, []);

  function syncFromEditor() {
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  }

  function runCmd(cmd) {
    if (mode === "source") return;
    editorRef.current?.focus();

    if (cmd === "h2" || cmd === "h3" || cmd === "p") {
      document.execCommand("formatBlock", false, cmd);
    } else if (cmd === "ul") {
      document.execCommand("insertUnorderedList");
    } else if (cmd === "ol") {
      document.execCommand("insertOrderedList");
    } else if (cmd === "link") {
      const url = window.prompt("URL liên kết:", "https://");
      if (url) document.execCommand("createLink", false, url);
    } else {
      document.execCommand(cmd);
    }
    syncFromEditor();
  }

  function switchMode(next) {
    if (next === mode) return;
    if (next === "source" && editorRef.current) {
      setHtml(editorRef.current.innerHTML);
    }
    if (next === "visual" && editorRef.current) {
      editorRef.current.innerHTML = html;
    }
    setMode(next);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <div className={styles.modeTabs}>
          <button
            type="button"
            className={mode === "visual" ? styles.modeActive : styles.modeBtn}
            onClick={() => switchMode("visual")}
          >
            Trực quan
          </button>
          <button
            type="button"
            className={mode === "source" ? styles.modeActive : styles.modeBtn}
            onClick={() => switchMode("source")}
          >
            HTML
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <>
          <div className={styles.toolbar}>
            {TOOLBAR.map((item) => (
              <button
                key={item.cmd}
                type="button"
                className={styles.toolBtn}
                title={item.title}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCmd(item.cmd)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div
            ref={editorRef}
            className={styles.editor}
            contentEditable
            suppressContentEditableWarning
            onInput={syncFromEditor}
            onBlur={syncFromEditor}
          />
        </>
      ) : (
        <textarea
          className={styles.source}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={12}
          spellCheck={false}
        />
      )}

      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
