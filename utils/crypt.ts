import crypto from "crypto";

export async function hashPin(pin: string) {
  try {
    const hash = crypto.createHash("sha512");
    hash.update(pin);
    return hash.digest("hex");
  } catch (error) {
    console.error("Error hashing password:", error);
  }
}
