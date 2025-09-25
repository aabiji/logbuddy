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

// Wrap the UserRequest in custom custom and return a callable function
function authenticatedRequestFactory(
  redirectToAuth: () => void,
  getTokens: () => { mainToken: string, refreshToken: string },
  updateTokens: (mainToken: string, refreshToken: string) => void
) {
  return async function innerFunction(makeRequest: UserRequest): Promise<object> {
    const { mainToken, refreshToken } = getTokens();

    try {
      return await makeRequest(mainToken); // issue the request
    } catch (err: any) {
      if (err.statusCode != 401) throw err; // not an jwt issue

      // the main token expired, get an another one and retry the request
      try {
        const json = await request("POST", "/auth/issue", undefined, refreshToken);
        updateTokens(json.mainToken, refreshToken);
        return await makeRequest(json.mainToken);
      } catch (err: any) {
        // refresh token expired, so reissue another
        // one by forcing the user to reauthenticate
        redirectToAuth();
        return {};
      }
    }
  }
}

// React hook to conveniently use the authenticatedRequestFactory
export function useAuthRequest() {
  const history = useHistory();
  const { mainToken, refreshToken, updateTokens } = useAppState();
  return authenticatedRequestFactory(
    () => history.replace("/auth"),
    () => ({ mainToken, refreshToken }),
    updateTokens
  );
}