import { useCallback } from "react";
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

type UserRequest = (token: string) => Promise<object>;

// Issue a request to the backend using the user's json
// web token and reissue another one if it expires
async function authenticatedRequest(
  mainToken: string,
  refreshToken: string,
  redirectToAuth: () => void,
  updateTokens: (a: string, b: string) => void,
  makeRequest: UserRequest,
): Promise<object> {
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

// react hook to call the authenticatedRequest function simply
export async function useUserRequest(makeRequest: UserRequest) {
  const history = useHistory();
  const { mainToken, refreshToken, updateTokens } = useAppState();

  const requestData = useCallback(async () => {
    const redirect = () => history.replace("/auth");
    return await authenticatedRequest(
      mainToken,
      refreshToken,
      redirect,
      updateTokens,
      makeRequest
    );
  }, [mainToken, refreshToken, updateTokens, makeRequest, history]);

  return requestData;
}
