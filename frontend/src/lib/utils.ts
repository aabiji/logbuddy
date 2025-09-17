
export async function request(
  method: string,
  endpoint: string,
  payload: object | undefined,
  token: string | undefined
) {
  const url = `http://localhost:8080${endpoint}`;
  const body = {method, headers: { "Content-Type": "application/json" }};
  if (payload !== undefined)
    body.body = JSON.stringify(payload);
  if (token !== undefined)
    body.headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, body);
  const json = await response.json();
  if (response.status != 200)
    throw new Error(json["error"]);
  return json;
}

export function formatDate(date: Date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  return formatter.format(date);
}