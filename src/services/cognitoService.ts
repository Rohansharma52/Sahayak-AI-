// Real OTP service — uses /api/send-otp backend in production
// Falls back to dev mode (OTP shown in console/response) during development

const IS_PROD = import.meta.env.PROD;

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "").slice(-10);
  return cleaned;
}

let pendingDevOtp: string | null = null;

export async function sendOTP(phone: string): Promise<void> {
  const cleanPhone = formatPhone(phone);

  if (IS_PROD) {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: cleanPhone, action: "send" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send OTP");
  } else {
    // Development: call backend which returns OTP in response
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, action: "send" }),
      });
      const data = await res.json();
      if (data.devOtp) {
        pendingDevOtp = data.devOtp;
        console.log(`%c OTP: ${data.devOtp} `, "background:#1f6b2a;color:white;font-size:20px;padding:8px");
        // Show OTP in a toast-friendly way
        (window as any).__DEV_OTP__ = data.devOtp;
      }
    } catch {
      // If backend not running in dev, use fixed OTP
      pendingDevOtp = "123456";
      console.log(`%c DEV OTP: 123456 `, "background:#1f6b2a;color:white;font-size:20px;padding:8px");
      (window as any).__DEV_OTP__ = "123456";
    }
  }
}

export async function verifyOTP(phone: string, code: string): Promise<void> {
  const cleanPhone = formatPhone(phone);

  if (IS_PROD) {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: cleanPhone, action: "verify", otp: code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Invalid OTP");
    // Store token from server
    if (data.token) localStorage.setItem("sahayak_token", data.token);
  } else {
    // Dev mode verification
    const validOtp = pendingDevOtp || (window as any).__DEV_OTP__ || "123456";
    if (code.trim() !== validOtp) throw new Error(`Invalid OTP. Check console for the correct OTP.`);
    localStorage.setItem("sahayak_token", "dev-token-" + Date.now());
  }
}

export function signIn(phone: string): Promise<string> {
  const formatted = "+91" + formatPhone(phone);
  localStorage.setItem("sahayak_phone", formatted);
  return Promise.resolve(localStorage.getItem("sahayak_token") || "");
}

export function getCurrentUser(): string | null {
  return localStorage.getItem("sahayak_phone");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("sahayak_token");
}

export function logout(): void {
  localStorage.removeItem("sahayak_token");
  localStorage.removeItem("sahayak_phone");
}
