async function generate() {
  try {
    setLoading(true);
    setError("");

    const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 720;

    const res = await fetch(`/api/generate-link?duration=${safeMinutes}`, {
      method: "GET",
      headers: { "accept": "application/json" },
    });

    const data = (await res.json()) as { link?: string; error?: string };

    if (!res.ok || !data.link) {
      throw new Error(data.error || "Erreur lors de la génération du lien");
    }

    setLink(data.link);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    setError(message);
  } finally {
    setLoading(false);
  }
}
