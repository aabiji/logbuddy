
export async function request(
  method: string,
  endpoint: string,
  payload: object | undefined,
  token: string | undefined
) {
  const url = `http://localhost:8080${endpoint}`;
  const body = {
    method,
    body: payload ? JSON.stringify(payload) : "",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    }
  };
  const response = await fetch(url, body);
  const json = await response.json();

  if (!response.ok) {
    const err = new Error(json["error"] || "Unknown error");
    err.statusCode = response.status;
    throw err;
  }
  return json;
}

export function formatDate(date: Date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  return formatter.format(date);
}