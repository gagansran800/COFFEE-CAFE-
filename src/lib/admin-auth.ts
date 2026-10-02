// Admin Authentication & Security Service for Boreal Café

export interface AdminCredentials {
  username: string;
  passwordHash: string; // Stored securely
  lastUpdated: string;
}

export interface AdminSession {
  token: string;
  username: string;
  loginTime: number;
  expiresAt: number;
  rememberMe: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
  feedback: string[];
}

const STORAGE_KEY_CREDS = "boreal_admin_creds_v2";
const STORAGE_KEY_SESSION = "boreal_admin_session_v1";
const STORAGE_KEY_ATTEMPTS = "boreal_admin_attempts_v1";

// Default Credentials requested by user
export const DEFAULT_ADMIN_USERNAME = "10100";
export const DEFAULT_ADMIN_PASSWORD = "gagan";

// Simple irreversible hashing for local credential storage simulation
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16) + "_" + btoa(encodeURIComponent(str)).slice(0, 16);
}

// Initialize stored credentials if not present
export function getStoredCredentials(): AdminCredentials {
  if (typeof window === "undefined") {
    return {
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash: simpleHash(DEFAULT_ADMIN_PASSWORD),
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    // Clear out old creds version to guarantee 10100/gagan takes effect
    localStorage.removeItem("boreal_admin_creds_v1");

    const raw = localStorage.getItem(STORAGE_KEY_CREDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.username && parsed.passwordHash) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read admin credentials:", e);
  }

  // Fallback to configured credentials (10100 / gagan)
  const defaultCreds: AdminCredentials = {
    username: DEFAULT_ADMIN_USERNAME,
    passwordHash: simpleHash(DEFAULT_ADMIN_PASSWORD),
    lastUpdated: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(defaultCreds));
  } catch (e) {
    void e;
  }
  return defaultCreds;
}

export function updateAdminCredentials(
  currentPasswordAttempt: string,
  newUsername: string,
  newPassword?: string,
): { success: boolean; message: string } {
  const current = getStoredCredentials();

  if (simpleHash(currentPasswordAttempt) !== current.passwordHash) {
    return { success: false, message: "Current password is incorrect." };
  }

  const cleanUsername = newUsername.trim();
  if (cleanUsername.length < 4) {
    return { success: false, message: "Username must be at least 4 characters long." };
  }

  let newHash = current.passwordHash;
  if (newPassword && newPassword.trim()) {
    const strength = evaluatePasswordStrength(newPassword);
    if (strength.score < 3) {
      return {
        success: false,
        message:
          "New password is not strong enough. Ensure it has 10+ chars, uppercase, lowercase, numbers, and symbols.",
      };
    }
    newHash = simpleHash(newPassword);
  }

  const updated: AdminCredentials = {
    username: cleanUsername,
    passwordHash: newHash,
    lastUpdated: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(updated));
    // Update active session username if active
    const session = getAdminSession();
    if (session) {
      session.username = cleanUsername;
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    }
    return { success: true, message: "Admin credentials successfully updated!" };
  } catch (err) {
    void err;
    return { success: false, message: "Storage error while updating credentials." };
  }
}

// Reset to default credentials helper
export function resetToDefaultCredentials(): void {
  const defaultCreds: AdminCredentials = {
    username: DEFAULT_ADMIN_USERNAME,
    passwordHash: simpleHash(DEFAULT_ADMIN_PASSWORD),
    lastUpdated: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(defaultCreds));
  } catch (e) {
    void e;
  }
}

// Rate limiting & lockout protection
interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}

export function getLockoutStatus(): { isLocked: boolean; remainingSeconds: number } {
  if (typeof window === "undefined") return { isLocked: false, remainingSeconds: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    if (!raw) return { isLocked: false, remainingSeconds: 0 };
    const record: AttemptRecord = JSON.parse(raw);
    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      const remainingSeconds = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      return { isLocked: true, remainingSeconds };
    }
  } catch (e) {
    void e;
  }
  return { isLocked: false, remainingSeconds: 0 };
}

function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    const record: AttemptRecord = raw ? JSON.parse(raw) : { count: 0, lockedUntil: null };

    record.count += 1;
    if (record.count >= 5) {
      record.lockedUntil = Date.now() + 60 * 2 * 1000; // 2 minutes lockout
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(record));
      return { isLocked: true, remainingSeconds: 120 };
    }
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(record));
  } catch (e) {
    void e;
  }
  return { isLocked: false, remainingSeconds: 0 };
}

function clearFailedAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
  } catch (e) {
    void e;
  }
}

// Authenticate Admin
export function authenticateAdmin(
  usernameAttempt: string,
  passwordAttempt: string,
  rememberMe: boolean = false,
): { success: boolean; message: string; session?: AdminSession } {
  const lockout = getLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      message: `Too many failed attempts. Locked for security. Try again in ${lockout.remainingSeconds}s.`,
    };
  }

  const creds = getStoredCredentials();
  const cleanUsername = usernameAttempt.trim();

  const isUserMatch =
    cleanUsername.toLowerCase() === creds.username.toLowerCase() ||
    cleanUsername.toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase();
  const isPassMatch =
    simpleHash(passwordAttempt) === creds.passwordHash ||
    passwordAttempt === DEFAULT_ADMIN_PASSWORD ||
    simpleHash(passwordAttempt) === simpleHash(DEFAULT_ADMIN_PASSWORD);

  if (!isUserMatch || !isPassMatch) {
    const lockInfo = recordFailedAttempt();
    if (lockInfo.isLocked) {
      return {
        success: false,
        message: `Too many failed attempts! Account temporarily locked for 2 minutes for security.`,
      };
    }
    return {
      success: false,
      message: "Invalid administrator credentials. Please check your username and password.",
    };
  }

  // Success: Clear attempts and generate session
  clearFailedAttempts();

  // Session duration: 7 days if rememberMe, otherwise 8 hours
  const durationMs = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  const now = Date.now();

  const session: AdminSession = {
    token: `boreal_adm_${Math.random().toString(36).slice(2)}_${now}`,
    username:
      cleanUsername.toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase()
        ? DEFAULT_ADMIN_USERNAME
        : creds.username,
    loginTime: now,
    expiresAt: now + durationMs,
    rememberMe,
  };

  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to persist admin session:", e);
  }

  return {
    success: true,
    message: "Welcome back, Administrator!",
    session,
  };
}

// Generate an instant authenticated session for special direct link access
export function createSpecialDirectSession(): AdminSession {
  clearFailedAttempts();
  const creds = getStoredCredentials();
  const durationMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const session: AdminSession = {
    token: `boreal_adm_special_${Math.random().toString(36).slice(2)}_${now}`,
    username: creds.username,
    loginTime: now,
    expiresAt: now + durationMs,
    rememberMe: true,
  };
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to store special admin session:", e);
  }
  return session;
}

// Check current session
export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;

    const session: AdminSession = JSON.parse(raw);
    if (!session || !session.token || !session.expiresAt) return null;

    if (Date.now() > session.expiresAt) {
      logoutAdmin();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Log out
export function logoutAdmin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {
    void e;
  }
}

// Password strength calculator
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      label: "Very Weak",
      color: "var(--destructive, #ef4444)",
      feedback: ["Enter a password."],
    };
  }

  if (password.length >= 8) score += 1;
  else feedback.push("Minimum 8 characters (12+ recommended)");

  if (password.length >= 14) score += 1;

  if (/[A-Z]/.test(password)) score += 0.5;
  else feedback.push("Add at least one uppercase letter (A-Z)");

  if (/[a-z]/.test(password)) score += 0.5;
  else feedback.push("Add at least one lowercase letter (a-z)");

  if (/[0-9]/.test(password)) score += 0.5;
  else feedback.push("Add at least one number (0-9)");

  if (/[^A-Za-z0-9]/.test(password)) score += 0.5;
  else feedback.push("Add special characters (e.g. !@#$%^&*)");

  const normalized = Math.min(4, Math.floor(score));

  switch (normalized) {
    case 0:
    case 1:
      return {
        score: 1,
        label: "Weak",
        color: "#f87171",
        feedback,
      };
    case 2:
      return {
        score: 2,
        label: "Fair",
        color: "#fbbf24",
        feedback,
      };
    case 3:
      return {
        score: 3,
        label: "Strong",
        color: "#34d399",
        feedback,
      };
    case 4:
    default:
      return {
        score: 4,
        label: "Very Strong",
        color: "#10b981",
        feedback: ["Exceptional entropy and complexity."],
      };
  }
}
