import { looksLikeHtml, sanitizeAdminHtml } from "@/lib/html-content";
import styles from "./HtmlContent.module.css";

/**
 * Render admin HTML or legacy plain-text marketing copy.
 * @param {{ html: string, className?: string }} props
 */
export default function HtmlContent({ html, className = "" }) {
  const content = String(html || "").trim();
  if (!content) return null;

  if (looksLikeHtml(content)) {
    return (
      <div
        className={`${styles.rich} ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: sanitizeAdminHtml(content) }}
      />
    );
  }

  return <p className={className}>{content}</p>;
}
