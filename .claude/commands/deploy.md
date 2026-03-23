# /deploy — Deployment Checklist

## 1. Code Quality
```bash
npm run lint
npm run build
npm run test
```

## 2. Environment Variables
- [ ] All required env vars set in Cloudflare Pages dashboard
- [ ] No keys hardcoded in code
- [ ] `.env.example` up to date

## 3. Git Status
```bash
git status        # No uncommitted changes
git log -3        # Recent commits look correct
git diff main...HEAD  # Full changeset review
```

## 4. Pre-deploy Confirmation
- [ ] Tested locally?
- [ ] Rollback plan exists?

## 5. Post-deploy Verification
- [ ] Visit production URL — accessible?
- [ ] Critical game flow works?
- [ ] No new errors in Cloudflare logs?
