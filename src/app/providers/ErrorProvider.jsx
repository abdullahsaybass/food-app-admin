// app/providers/ErrorProvider.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { normalizeError, isGlobalError } from "../../shared/lib/error-handler.js";
import styles from "./ErrorProvider.module.css";

const ErrorContext = createContext(null);
 
/** @typedef {{ message: string, errors?: string[], statusCode?: number }} ApiError */
 
export function ErrorProvider({ children }) {
  const [error, setErrorState] = useState(/** @type {ApiError | null} */ (null));
 
  const setError = useCallback((raw) => {
    const normalized = normalizeError(raw);
    if (isGlobalError(normalized)) setErrorState(normalized);
  }, []);
 
  const clearError = useCallback(() => setErrorState(null), []);
 
  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
      {error && <GlobalErrorBanner error={error} onClose={clearError} />}
    </ErrorContext.Provider>
  );
}
 
export const useError = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useError must be used within ErrorProvider");
  return ctx;
};
 
function GlobalErrorBanner({ error, onClose }) {
  const is500 = error.statusCode && error.statusCode >= 500;
  return (
    <div className={styles.overlay}>
      <div className={`${styles.banner} ${is500 ? styles.error : styles.warning}`}>
        <div className={styles.left}>
          <span className={styles.icon}>{is500 ? "🔴" : "⚠️"}</span>
          <div>
            <p className={`${styles.message} ${is500 ? styles.errorText : styles.warningText}`}>
              {error.message}
            </p>
            {(error.statusCode === 401 || error.statusCode === 403) && (
              <p className={styles.sub}>Please log in again to continue.</p>
            )}
            {error.errors?.map((e, i) => <p key={i} className={styles.sub}>{e}</p>)}
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
    </div>
  );
}