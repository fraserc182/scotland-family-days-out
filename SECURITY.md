# Security Guidelines

This document outlines security best practices for Scotland Days Out.

## Security Headers

The application includes the following security headers:

- **X-Content-Type-Options: nosniff** - Prevents MIME type sniffing
- **X-Frame-Options: SAMEORIGIN** - Prevents clickjacking
- **X-XSS-Protection: 1; mode=block** - Enables XSS protection
- **Referrer-Policy: strict-origin-when-cross-origin** - Controls referrer information
- **Permissions-Policy** - Restricts access to camera, microphone, and geolocation

## Environment Variables

### Never commit sensitive data

Always use environment variables for sensitive information:

```env
# ✅ Good - Use environment variables
NEXT_PUBLIC_GA_ID=your-id
NEXT_PUBLIC_SENTRY_DSN=your-dsn

# ❌ Bad - Never hardcode secrets
const API_KEY = "sk_live_abc123"
```

### Public vs Private Variables

- **NEXT_PUBLIC_*** - Exposed to browser (use for non-sensitive data only)
- **Other variables** - Server-side only (use for secrets)

## Data Protection

### Local Storage

The application uses browser local storage to save favorites:

```javascript
// Data stored locally on user's device
localStorage.setItem('sd_favs', JSON.stringify(favorites))
```

**Important**: Local storage is not encrypted. Don't store sensitive data.

### Activities Data

Activities are loaded from `public/activities.json`:

- Data is public and not sensitive
- No authentication required
- Data is validated before use

## Dependency Security

### Regular Updates

Keep dependencies up to date:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Trusted Sources

- Only install packages from npm registry
- Verify package authenticity
- Check package downloads and GitHub stars
- Review package source code

## Code Security

### Input Validation

Always validate user input:

```typescript
// ✅ Good - Validate input
if (typeof query === 'string' && query.length > 0) {
  // Process query
}

// ❌ Bad - No validation
const result = data.filter(item => item.name.includes(userInput))
```

### XSS Prevention

React automatically escapes content:

```jsx
// ✅ Good - React escapes this
<div>{userInput}</div>

// ❌ Bad - Don't use dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### CSRF Protection

Next.js provides built-in CSRF protection for forms.

## API Security

### HTTPS Only

Always use HTTPS in production:

```bash
# Verify HTTPS is enforced
curl -I https://scotland-days-out.com
```

### CORS

Configure CORS properly if using external APIs:

```typescript
// Only allow requests from your domain
const corsOptions = {
  origin: 'https://scotland-days-out.com',
  credentials: true,
}
```

## Authentication & Authorization

### If adding user accounts:

1. **Use secure password hashing**
   - Use bcrypt or similar
   - Never store plain text passwords

2. **Implement proper session management**
   - Use secure, httpOnly cookies
   - Set appropriate expiration times
   - Regenerate session IDs

3. **Use HTTPS for all auth requests**
   - Encrypt data in transit
   - Prevent man-in-the-middle attacks

## Error Handling

### Don't expose sensitive information

```typescript
// ✅ Good - Generic error message
catch (error) {
  console.error('Failed to load activities:', error)
  return { error: 'Failed to load data' }
}

// ❌ Bad - Exposes sensitive info
catch (error) {
  return { error: error.message, stack: error.stack }
}
```

## Monitoring & Logging

### Error Tracking

Set up error tracking with Sentry:

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Access Logs

Monitor access logs for suspicious activity:

- Unusual request patterns
- Failed authentication attempts
- Rate limiting violations

## Third-Party Services

### Verify Integrations

When integrating third-party services:

1. Check their security certifications
2. Review their privacy policy
3. Verify data handling practices
4. Use API keys securely
5. Monitor for security updates

### Analytics

Google Analytics:
- Anonymize IP addresses
- Respect user privacy
- Follow GDPR requirements

## Compliance

### GDPR (EU Users)

- Provide privacy policy
- Get consent for tracking
- Allow data deletion
- Implement right to be forgotten

### CCPA (California Users)

- Disclose data collection
- Allow opt-out
- Provide data access
- Implement data deletion

## Security Checklist

- [ ] All dependencies are up to date
- [ ] No sensitive data in code
- [ ] Environment variables are configured
- [ ] HTTPS is enforced
- [ ] Security headers are set
- [ ] Error handling doesn't expose sensitive info
- [ ] Input validation is implemented
- [ ] XSS protection is enabled
- [ ] CSRF protection is enabled
- [ ] Error tracking is configured
- [ ] Privacy policy is in place
- [ ] Terms of service are in place
- [ ] Regular security audits are performed

## Reporting Security Issues

If you discover a security vulnerability:

1. **Don't** post it publicly
2. Email: security@scotland-days-out.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [npm Security](https://docs.npmjs.com/cli/v8/commands/npm-audit)

