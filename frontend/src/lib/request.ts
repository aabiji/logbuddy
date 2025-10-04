import { useHistory } from "react-router";
import { useAppState } from "./state";

// Create a request to the backend
export async function request(
  method: string,
  endpoint: string,
  payload: object | undefined,
  token: string | undefined
): Promise<object> {
  const url = `http://localhost:8080${endpoint}`;
  let body = { method, headers: { "Content-Type": "application/json" } };
  if (payload) body.body = JSON.stringify(payload);
  if (token) body.headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, body);
  const json = await response.json();
  if (!response.ok) {
    const err = new Error(json["error"] || "Unknown error");
    err.statusCode = response.status;
    throw err;
  }
  return json;
}

type UserRequest = (jwt: string) => Promise<object>;

// factory function to make api requests with some added error handling
export function useAuthRequest() {
  const history = useHistory();
  const { token } = useAppState();

  return async (makeRequest: UserRequest): Promise<object> => {
    try {
      return await makeRequest(token); // issue the request
    } catch (err: any) {
      // redirect to the auth page if it's an auth issue
      if (err.statusCode != 401) throw err;
      history.replace("/auth");
      return {};
    }
  }
}