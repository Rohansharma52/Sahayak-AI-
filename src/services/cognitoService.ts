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
/**
 * MOCK OTP SYSTEM FOR TESTING
 */
const MOCK_OTPS = ["726626", "131514", "692005", "152008"];

export function sendOTP(phone: string): Promise<void> {
  _currentPhone = formatPhone(phone);
  console.log(`[MOCK] Sending OTP from valid list to:`, _currentPhone);
  
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve();
    }, 800);
  });
}

export function verifyOTP(phone: string, code: string): Promise<void> {
  const formattedPhone = formatPhone(phone);
  console.log(`[MOCK] Verifying OTP ${code} for:`, formattedPhone);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MOCK_OTPS.includes(code.trim())) {
        resolve();
      } else {
        reject(new Error("Invalid OTP. Please try again."));
      }
    }, 500);
  });
}

export function signIn(phone: string): Promise<string> {
  const formattedPhone = formatPhone(phone);
  const mockToken = "mock-jwt-token-" + Date.now();
  
  localStorage.setItem("sahayak_token", mockToken);
  localStorage.setItem("sahayak_phone", formattedPhone);
  
  return Promise.resolve(mockToken);
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
