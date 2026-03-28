import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID as string,
  ClientId: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID as string,
};

const userPool = new CognitoUserPool(poolData);

let _currentPhone = "";
// Track if this is a returning (already confirmed) user login
let _isReturningUser = false;

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  return cleaned.startsWith("+") ? cleaned : `+91${cleaned}`;
}

function getCognitoUser(phone: string): CognitoUser {
  return new CognitoUser({ Username: phone, Pool: userPool });
}

/**
 * Step 1 — Send OTP.
 * - New user: signUp → Cognito sends confirmation OTP
 * - Returning confirmed user: forgotPassword → Cognito sends reset OTP
 */
export function sendOTP(phone: string): Promise<void> {
  _currentPhone = formatPhone(phone);
  _isReturningUser = false;

  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: "phone_number", Value: _currentPhone }),
    ];

    userPool.signUp(_currentPhone, generateTempPassword(), attributes, [], (err) => {
      if (!err) {
        // New user — OTP sent via signUp confirmation
        _isReturningUser = false;
        return resolve();
      }

      if (err.name === "UsernameExistsException") {
        // Returning user — use forgotPassword to send OTP via SMS
        _isReturningUser = true;
        const cognitoUser = getCognitoUser(_currentPhone);
        cognitoUser.forgotPassword({
          onSuccess: () => resolve(),
          onFailure: (fpErr) => reject(new Error(fpErr.message)),
          inputVerificationCode: () => resolve(), // OTP sent, waiting for input
        });
      } else {
        reject(new Error(err.message));
      }
    });
  });
}

/**
 * Step 2 — Verify OTP.
 * - New user: confirmRegistration
 * - Returning user: confirmPassword (completes forgotPassword flow)
 */
export function verifyOTP(phone: string, code: string): Promise<void> {
  const formattedPhone = formatPhone(phone);
  const cognitoUser = getCognitoUser(formattedPhone);

  return new Promise((resolve, reject) => {
    if (_isReturningUser) {
      // Confirm new password using the OTP
      cognitoUser.confirmPassword(code, generateTempPassword(), {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(new Error(err.message)),
      });
    } else {
      cognitoUser.confirmRegistration(code, true, (err) => {
        if (err) return reject(new Error(err.message));
        resolve();
      });
    }
  });
}

/**
 * Step 3 — Sign in after OTP verified.
 */
export function signIn(phone: string): Promise<string> {
  const formattedPhone = formatPhone(phone);
  const cognitoUser = getCognitoUser(formattedPhone);

  const authDetails = new AuthenticationDetails({
    Username: formattedPhone,
    Password: generateTempPassword(),
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const token = session.getAccessToken().getJwtToken();
        localStorage.setItem("sahayak_token", token);
        localStorage.setItem("sahayak_phone", formattedPhone);
        resolve(token);
      },
      onFailure: (err) => reject(new Error(err.message)),
    });
  });
}

export function getCurrentUser(): string | null {
  return localStorage.getItem("sahayak_phone");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("sahayak_token");
}

export function logout(): void {
  const phone = localStorage.getItem("sahayak_phone");
  if (phone) {
    try { getCognitoUser(phone).signOut(); } catch { /* ignore */ }
  }
  localStorage.removeItem("sahayak_token");
  localStorage.removeItem("sahayak_phone");
}

function generateTempPassword(): string {
  return `Sahayak@2024!`;
}
