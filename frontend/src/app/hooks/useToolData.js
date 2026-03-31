import { useEffect, useState } from "react";

export function formatGenerated(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/**
 * Manages the fetch-on-mount + generate lifecycle common to all tool tabs.
 * Returns { data, setData, loading, generating, error, generate }.
 * `generate()` can be called directly or wrapped for pre-generate side-effects.
 */
export function useToolData(getFn, generateFn, id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getFn(id)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      setData(await generateFn(id));
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  return { data, setData, loading, generating, error, generate };
}
