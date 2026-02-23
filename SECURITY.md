# Security Policy

## Supported Versions

The following versions of MMM-MyTeams-LeagueTable are currently supported with security updates:

| Version | Supported          | Status                          |
| ------- | ------------------ | ------------------------------- |
| 2.x.x   | :white_check_mark: | Active development              |
| 1.9.x   | :white_check_mark: | Security fixes only             |
| < 1.9   | :x:                | No longer supported             |

## Reporting a Vulnerability

**IMPORTANT**: **DO NOT** open a public GitHub issue for security vulnerabilities.

Security vulnerabilities should be reported privately to maintain responsible disclosure and protect users.

### How to Report

Please report security vulnerabilities by:

1. **Opening a private security advisory** on GitHub (preferred)
   - Go to the Security tab → Advisories → New draft security advisory
   - Provide detailed information about the vulnerability

2. **Emailing** the maintainers directly (if GitHub advisory is not available)
   - Contact: [Repository owner's contact]
   - Subject line: "[SECURITY] MMM-MyTeams-LeagueTable Vulnerability Report"

### What to Include

When reporting a vulnerability, please include:

- **Description**: Clear explanation of the vulnerability
- **Impact**: What could an attacker accomplish?
- **Steps to Reproduce**: Detailed steps to demonstrate the vulnerability
- **Affected Versions**: Which versions are impacted
- **Suggested Fix**: If you have recommendations (optional)
- **Proof of Concept**: Code or screenshots demonstrating the issue (if applicable)

### Response Timeline

- **Initial Response**: Within 48 hours of report
- **Status Update**: Within 7 days with assessment and timeline
- **Critical Vulnerabilities**: Patched within 7 days when possible
- **Medium/Low Vulnerabilities**: Patched in next scheduled release

## Security Update Process

When a security vulnerability is confirmed:

1. **Assessment**: Vulnerability is verified and impact assessed
2. **Development**: Patch is developed and tested in private fork
3. **Coordination**: If affects other projects, coordinate disclosure
4. **Release**: Security update published with advisory
5. **Notification**: Users notified via:
   - GitHub Security Advisory
   - GitHub Release Notes
   - Repository README banner (for critical issues)

## Security Best Practices for Users

### Installation Security

```bash
# Always verify package integrity
npm audit

# Fix known vulnerabilities
npm audit fix

# Keep dependencies updated
npm update
```

### Configuration Security

- **Disable debug mode in production**
  ```javascript
  config: {
    debug: false,  // Never enable in production
    debugSensitiveData: false
  }
  ```

- **Use restrictive Content Security Policy (CSP)**
  - See README.md for recommended CSP headers
  - Limit `script-src`, `img-src`, `connect-src` to required domains only

- **Limit network access**
  - Configure firewall to allow only required domains:
    - `www.bbc.co.uk` (required for league data)
    - `www.fifa.com` (required for World Cup data)

- **Regular updates**
  - Keep MagicMirror² and this module updated
  - Subscribe to repository releases for notifications

### Data Privacy

This module:
- ✅ **Does NOT** collect or transmit user data
- ✅ **Does NOT** use cookies or tracking
- ✅ **Does NOT** require authentication or API keys
- ✅ Operates entirely on public BBC Sport data
- ✅ Caches data locally only (`.cache/` directory)

### Known Security Measures

The module implements the following security practices:

- **Zero innerHTML usage**: Prevents XSS vulnerabilities via safe DOM manipulation
- **Input validation**: All user configuration validated and sanitized
- **Secure dependencies**: Minimal dependency footprint (single production dependency)
- **Async I/O**: Non-blocking operations prevent DoS via resource exhaustion
- **Debug logging controls**: No sensitive data logged in production
- **Path sanitization**: Cache file paths sanitized to prevent directory traversal

## Security Audit Schedule

- **Automated audits**: Run `npm audit` on every dependency update
- **Manual code review**: Conducted before each major release
- **Dependency updates**: Reviewed quarterly
- **Penetration testing**: Community-driven (responsible disclosure welcome)

## Vulnerability Disclosure Policy

We follow **Coordinated Vulnerability Disclosure (CVD)**:

1. **Private disclosure** to maintainers first
2. **Patch development** in coordination with reporter
3. **Public disclosure** only after patch is available
4. **Credit** given to reporter in release notes (unless anonymity requested)

## Security Hall of Fame

Security researchers who responsibly disclose vulnerabilities will be credited here:

*No vulnerabilities reported yet. Help us maintain security!*

## Scope

### In Scope

Security vulnerabilities in:
- Module code (MMM-MyTeams-LeagueTable.js, node_helper.js)
- Parser code (BBCParser.js, FIFAParser.js)
- Cache management (cache-manager.js)
- Dependencies (node-fetch)

### Out of Scope

- MagicMirror² core vulnerabilities (report to MagicMirror² project)
- BBC Sport website vulnerabilities (report to BBC)
- Third-party module interactions
- Physical access attacks (kiosk security is user's responsibility)
- Social engineering attacks

## Contact

For security-related questions or concerns:

- **Security Issues**: Use GitHub Security Advisories (preferred)
- **General Security Questions**: Open a public GitHub Discussion
- **Security Documentation**: Refer to README.md and this SECURITY.md

## Version History

| Date       | Version | Security Changes                              |
|------------|---------|-----------------------------------------------|
| 2026-02-23 | 2.1.0   | Security policy established, audit process    |
| 2026-02-21 | 1.9.0   | innerHTML eliminated, input validation added  |

---

**Last Updated**: February 23, 2026  
**Policy Version**: 1.0
