import { useHistory } from "react-router";
import { useAppState } from "./state";

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, ApiError);
  }
}


// Create a request to the backend
export async function request(
  method: string,
  endpoint: string,
  payload: object | undefined,
  token: string | undefined
): Promise<object> {
  const url = `${process.env.BACKEND_API_URL}${endpoint}`;
  let headers: Record<string, string> = { "Content-Type": "application/json" };

  let body: RequestInit = { method };
  if (payload) body.body = JSON.stringify(payload);
  if (token) headers["Authorization"] = `Bearer ${token}`;
  body.headers = headers;

  const response = await fetch(url, body);
  const json = await response.json();
  if (!response.ok)
    throw new ApiError(json["error"] || "Unknown error", response.status);
  return json;
}

type UserRequest = (jwt: string) => Promise<object>;

// factory function to make api requests with some added error handling
export function useAuthRequest() {
  const history = useHistory();
  const { addNotification, token } = useAppState();

  return async (makeRequest: UserRequest): Promise<object | undefined> => {
    try {
      return await makeRequest(token); // issue the request
    } catch (err: any) {
      // redirect to the auth page if it's an auth issue
      if (err.statusCode == 401)
        history.replace("/auth");
      else
        addNotification({ message: err.message, error: true });
      return undefined;
    }
  }
}
