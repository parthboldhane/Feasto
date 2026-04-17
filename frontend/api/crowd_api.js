const API_BASE = "http://127.0.0.1:8000";

// GET CROWD DATA
export async function getCrowd() {
  try {
    const res = await fetch(`${API_BASE}/api/crowd`);
    if (!res.ok) throw new Error("Failed to fetch crowd");
    return await res.json();
  } catch (err) {
    console.error("getCrowd error:", err);
    return null;
  }
}

// ADMIN SET CROWD
export async function setCrowd(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/crowd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update crowd");
    return await res.json();
  } catch (err) {
    console.error("setCrowd error:", err);
    return null;
  }
}

// PREDICT CROWD (NEW 🔥)
export async function predictCrowd(time) {
  try {
    const res = await fetch(`${API_BASE}/api/crowd/predict?time=${time}`);
    if (!res.ok) throw new Error("Prediction failed");
    return await res.json();
  } catch (err) {
    console.error("predictCrowd error:", err);
    return null;
  }
}