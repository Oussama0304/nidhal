import { differenceInMinutes } from 'date-fns';

const MAX_LOGIN_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 15;

class SecurityService {
  constructor() {
    this.loginAttempts = new Map();
    this.blockedIPs = new Map();
  }

  getClientIdentifier() {
    // En production, vous pouvez utiliser l'IP du client
    return window.navigator.userAgent;
  }

  isBlocked(identifier) {
    if (!this.blockedIPs.has(identifier)) {
      return false;
    }

    const blockTime = this.blockedIPs.get(identifier);
    const timeDiff = differenceInMinutes(new Date(), blockTime);

    if (timeDiff >= BLOCK_DURATION_MINUTES) {
      this.blockedIPs.delete(identifier);
      this.loginAttempts.delete(identifier);
      return false;
    }

    return true;
  }

  getRemainingBlockTime(identifier) {
    if (!this.blockedIPs.has(identifier)) {
      return 0;
    }

    const blockTime = this.blockedIPs.get(identifier);
    const timeDiff = differenceInMinutes(new Date(), blockTime);
    return Math.max(0, BLOCK_DURATION_MINUTES - timeDiff);
  }

  recordLoginAttempt(identifier, success) {
    if (success) {
      this.loginAttempts.delete(identifier);
      this.blockedIPs.delete(identifier);
      return;
    }

    const attempts = (this.loginAttempts.get(identifier) || 0) + 1;
    this.loginAttempts.set(identifier, attempts);

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      this.blockedIPs.set(identifier, new Date());
    }

    return attempts;
  }

  getLoginAttempts(identifier) {
    return this.loginAttempts.get(identifier) || 0;
  }

  shouldShowCaptcha(identifier) {
    return this.getLoginAttempts(identifier) >= 2;
  }

  reset(identifier) {
    this.loginAttempts.delete(identifier);
    this.blockedIPs.delete(identifier);
  }
}

export const securityService = new SecurityService();
