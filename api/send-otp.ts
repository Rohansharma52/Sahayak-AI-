import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// In-memory OTP store (use Redis in production for multi-instance)
const otpStore: Record<string, { otp: string; expires: number; attempts: number }> = {};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 ? cleaned : cleaned.slice(-10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { phone, action, otp: userOtp } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  const cleanPhone = formatPhone(phone);
  if (cleanPhone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });

  // SEND OTP
  if (action === "send") {
    const otp = generateOTP();
    otpStore[cleanPhone] = { otp, expires: Date.now() + 5 * 60 * 1000, attempts: 0 }; // 5 min expiry

    const fast2smsKey = process.env.FAST2SMS_API_KEY;

    if (fast2smsKey) {
      // Real SMS via Fast2SMS (free Indian SMS API)
      try {
        const smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            authorization: fast2smsKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            route: "otp",
            variables_values: otp,
            numbers: cleanPhone,
          }),
        });
        const smsData = await smsRes.json();
        if (!smsData.return) throw new Error(smsData.message);
        return res.status(200).json({ success: true, message: "OTP sent via SMS" });
      } catch (e: any) {
        console.error("SMS failed:", e.message);
        // Fall through to dev mode
      }
    }

    // Dev mode — return OTP in response (remove in production)
    console.log(`[DEV] OTP for ${cleanPhone}: ${otp}`);
    return res.status(200).json({ success: true, devOtp: process.env.NODE_ENV !== "production" ? otp : undefined });
  }

  // VERIFY OTP
  if (action === "verify") {
    const record = otpStore[cleanPhone];
    if (!record) return res.status(400).json({ error: "OTP not sent or expired. Request a new one." });
    if (Date.now() > record.expires) {
      delete otpStore[cleanPhone];
      return res.status(400).json({ error: "OTP expired. Request a new one." });
    }
    record.attempts++;
    if (record.attempts > 5) {
      delete otpStore[cleanPhone];
      return res.status(429).json({ error: "Too many attempts. Request a new OTP." });
    }
    if (record.otp !== userOtp?.trim()) {
      return res.status(400).json({ error: `Invalid OTP. ${5 - record.attempts} attempts remaining.` });
    }
    delete otpStore[cleanPhone];
    // Generate session token
    const token = crypto.randomBytes(32).toString("hex");
    return res.status(200).json({ success: true, token });
  }

  return res.status(400).json({ error: "Invalid action" });
}
