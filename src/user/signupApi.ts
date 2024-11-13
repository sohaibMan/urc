import { SessionCallback, ErrorCallback, User } from "../model/common";
import { CustomError } from "../model/CustomError";
import { loginUser } from "./loginApi";

export function registerUser(user: User, onResult: SessionCallback, onError: ErrorCallback): void {
  fetch("/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then(async (response) => {
      if (response.ok) {
        // Registration successful, proceed to login
        loginUser(user, onResult, onError);
      } else {
        const error = (await response.json()) as CustomError;
        onError(error);
      }
    })
    .catch((error) => {
      // Handle other errors, e.g., network issues
      console.error(error);
      const networkError: CustomError = { name: 'NetworkError', code: "NETWORK_ERROR", message: "Network error occurred" };
      onError(networkError);
    });
}
