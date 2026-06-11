async function request(method, path, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const json = await res.json();
      detail = json.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  return res.json();
}

async function upload(path, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(path, { method: "POST", body: form });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const json = await res.json();
      detail = json.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  dataStatus:      ()                  => request("GET",  "/api/data/status"),
  generateData:    ()                  => request("POST", "/api/data/generate"),
  clearData:       ()                  => request("POST", "/api/data/clear"),
  uploadCsv:       (file)              => upload("/api/data/upload", file),
  addTransaction:  (tx)                => request("POST", "/api/transactions", tx),
  getTransactions: (limit = 50, offset = 0) =>
    request("GET", `/api/transactions?limit=${limit}&offset=${offset}`),
  getStatsSummary: ()                  => request("GET",  "/api/stats/summary"),
  getInsights:     ()                  => request("GET",  "/api/insights"),
  ask:             (question)          => request("POST", "/api/ask", { question }),
};
