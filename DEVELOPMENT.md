# MemePot Development Guide

> Internal development documentation for troubleshooting, code patterns, and common issues encountered during development

## 📋 Quick Reference

| Issue                                      | Root Cause                     | Solution                                                               |
| ------------------------------------------ | ------------------------------ | ---------------------------------------------------------------------- |
| Git HTTP 400                               | Large buffer overflow          | `git config --global http.postBuffer 524288000`                        |
| Hydration mismatch                         | Math.random() in render        | Move to useEffect hook                                                 |
| Module not found                           | Wrong import path              | Use `~` alias (`~/components/...`)                                     |
| ESLint `@next/next/no-html-link-for-pages` | HTML `<a>` tags in navigation  | Use `next/link` component                                              |
| TypeScript type error on status            | String literal type too strict | Use union type: `"pending" \| "processing" \| "completed" \| "failed"` |

---

## 🔴 Common Issues & Solutions

### 1. Git HTTP 400 Error

**Error Message:**

```
fatal: unable to access 'https://github.com/...': The requested URL returned error: 400
```

**Root Cause:** Git buffer exceeded when pushing large commits or many files

**Solution:**

```bash
git config --global http.postBuffer 524288000
```

**Explanation:** Increases the HTTP POST buffer from default (1MB) to 500MB, allowing larger pushes.

**Verification:**

```bash
git config --global http.postBuffer
# Should output: 524288000
```

---

### 2. Hydration Mismatch (Math.random / Date.now)

**Error Message:**

```
Warning: Did not expect server HTML to contain a <div> with class "opacity-[0.456]" in <div class="stars">
```

**Root Cause:** Client renders random values during hydration, but server didn't generate the same random seed

**Problem Code:**

```tsx
// ❌ WRONG: Random generation in render
export default function HeroSection() {
  return (
    <div className="stars">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: Math.random() * 100 + "%", // Different on server/client!
            opacity: Math.random() * 0.7 + 0.3,
          }}
        />
      ))}
    </div>
  );
}
```

**Solution Code:**

```tsx
"use client";
import { useEffect, useState } from "react";

interface Star {
  top: number;
  opacity: number;
}

export default function HeroSection() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // ✅ RIGHT: Random generation only on client after mount
    setStars(
      [...Array(50)].map(() => ({
        top: Math.random() * 100,
        opacity: Math.random() * 0.7 + 0.3,
      }))
    );
  }, []); // Empty dependency array = run once on mount

  return (
    <div className="stars">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: star.top + "%",
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}
```

**Key Principles:**

- Mark component with `"use client"` directive
- Initialize state with empty/default values
- Generate random values ONLY in `useEffect`
- Use empty dependency array `[]` to run once on mount

**Affected Files in This Project:**

- `/app/prizes/page.tsx` - Stars background animation
- Any component using `Math.random()` or `Date.now()`

---

### 3. Module Not Found Error

**Error Message:**

```
Module not found: Can't resolve '@/components/Header'
```

**Root Cause:** Using wrong import alias or incorrect relative path

**Problem Code:**

```tsx
// ❌ WRONG: Missing ~ alias
import Header from "@/components/Header";
import { useScaffoldReadContract } from "../../hooks/scaffold-eth";

// ❌ WRONG: Old React Router syntax
import { useNavigate } from "react-router-dom";
```

**Solution Code:**

```tsx
// ✅ RIGHT: Using ~ alias for monorepo
import Header from "~/components/Header";
import { useScaffoldReadContract } from "~/hooks/scaffold-eth";

// ✅ RIGHT: Next.js navigation
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/dashboard");
```

**Alias Configuration** (already set in `tsconfig.json`):

```json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./*"]
    }
  }
}
```

**Affected Files:**

- All files importing from `packages/nextjs/` should use `~/` prefix
- All React Router imports should be replaced with Next.js equivalents

---

### 4. React Router vs Next.js Navigation

**Error Message:**

```
error - Failed to compile.
./app/prizes/page.tsx
6:8
ESLint: The next/link component should be used instead of the HTML <a> element.
```

**Root Cause:** Project migrated from React Router (Pages Router) to Next.js App Router

**Problem Code:**

```tsx
// ❌ WRONG: React Router syntax
import { Link, useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";

export default function PrizesPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <>
      <Link to="/dashboard">Back to Dashboard</Link>
      <button onClick={() => navigate("/vaults")}>Go to Vaults</button>
    </>
  );
}
```

**Solution Code:**

```tsx
// ✅ RIGHT: Next.js App Router syntax
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

interface PrizesPageProps {
  params: Promise<{ id: string }>;
}

export default function PrizesPage({ params }: PrizesPageProps) {
  const router = useRouter();
  const { id } = use(params); // Unwrap Promise from params

  return (
    <>
      <Link href="/dashboard">Back to Dashboard</Link>
      <button onClick={() => router.push("/vaults")}>Go to Vaults</button>
    </>
  );
}
```

**Migration Pattern:**

| React Router                              | Next.js App Router                   |
| ----------------------------------------- | ------------------------------------ |
| `import { Link } from "react-router-dom"` | `import Link from "next/link"`       |
| `<Link to="/path">`                       | `<Link href="/path">`                |
| `useNavigate()`                           | `useRouter()`                        |
| `navigate("/path")`                       | `router.push("/path")`               |
| `useParams()` + `params.id`               | `use(params)` + destructure `id`     |
| `useLocation()`                           | `usePathname()`, `useSearchParams()` |
| `<Route path="/path/:id">`                | `/app/path/[id]/page.tsx`            |

**Affected Files Migrated:**

- `/app/ready/page.tsx`
- `/app/about/page.tsx`
- `/app/prizes/page.tsx`
- `/app/prizes-detail/[id]/page.tsx`
- `/app/dashboard/page.tsx`

---

### 5. TypeScript Type Error: Union Type Status

**Error Message:**

```
Type '"processing"' is not assignable to type '"pending"'.
```

**Root Cause:** Transaction status defined as `as const` (too strict) instead of union type

**Problem Code:**

```tsx
// ❌ WRONG: as const makes type too specific
const STEP_STATUSES = {
  pending: "pending",
  processing: "processing",
  completed: "completed",
  failed: "failed",
} as const;

type StepStatus = (typeof STEP_STATUSES)[keyof typeof STEP_STATUSES];

// Later: TypeScript complains if you try to set different statuses
setSteps((prev) =>
  prev.map((s) => ({
    ...s,
    status: "completed", // ❌ Error: Type '"completed"' is not assignable...
  }))
);
```

**Solution Code:**

```tsx
// ✅ RIGHT: Explicit union type
type TransactionStepStatus = "pending" | "processing" | "completed" | "failed";

interface TransactionStep {
  id: string;
  label: string;
  status: TransactionStepStatus;
}

// Later: All statuses are valid
setSteps((prev) =>
  prev.map((s) => ({
    ...s,
    status: "completed", // ✅ Valid
  }))
);

// Or with type guard
const updateStepStatus = (stepId: string, newStatus: TransactionStepStatus) => {
  setSteps((prev) =>
    prev.map((s) => (s.id === stepId ? { ...s, status: newStatus } : s))
  );
};
```

**Affected Files:**

- `/app/dashboard/components/MyVaultsSection.tsx`
- `/app/dashboard/components/PrizeStatusSection.tsx`
- Any component managing transaction states

---

### 6. ESLint: "use client" Directive Missing

**Error Message:**

```
error - 'useState' is not defined
This is likely caused by a missing "use client" directive at the top of the file.
```

**Root Cause:** Component uses React hooks but isn't marked as Client Component

**Problem Code:**

```tsx
// ❌ WRONG: No "use client" directive
import { useState } from "react";

export default function MyComponent() {
  const [count, setCount] = useState(0); // Error!
  return <div>{count}</div>;
}
```

**Solution Code:**

```tsx
// ✅ RIGHT: Add "use client" at the top
"use client";
import { useState } from "react";

export default function MyComponent() {
  const [count, setCount] = useState(0); // ✅ Works
  return <div>{count}</div>;
}
```

**When to Use "use client":**

```tsx
// ✅ Use "use client" for:
- useState, useEffect, useRef hooks
- Event handlers (onClick, onChange, etc.)
- Context.useContext()
- Custom hooks using React hooks
- Browser APIs (window, localStorage, etc.)

// ❌ Don't use "use client" for:
- Server-only code (databases, secrets)
- Metadata (generateMetadata())
- File reading (Server Components)
```

**Affected Files (Already Fixed):**

- All files with hooks have `"use client"` directive at top

---

### 7. ESLint: Unused Variables

**Error Message:**

```
warning - 'params' is defined but never used. (@typescript-eslint/no-unused-vars)
```

**Problem Code:**

```tsx
// ❌ WRONG: Unused parameters
export default function MyComponent({ unused, count }: Props) {
  return <div>{count}</div>;
}
```

**Solution Code:**

```tsx
// ✅ RIGHT: Remove unused parameters
export default function MyComponent({ count }: Props) {
  return <div>{count}</div>;
}

// If intentionally unused (e.g., destructuring for documentation):
export default function MyComponent({ count, _unused }: Props) {
  return <div>{count}</div>;
}
```

---

### 8. Ref Cleanup in useEffect

**Error Message:**

```
warning - "useEffect cleanup function is not safe to use with JSX..."
```

**Problem Code:**

```tsx
// ❌ WRONG: Refs accessed after cleanup
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  return () => {
    if (ref.current) {
      ref.current.style.display = "none"; // ❌ May have been unmounted
    }
  };
}, []);
```

**Solution Code:**

```tsx
// ✅ RIGHT: Cleanup dependencies included
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  const element = ref.current;

  return () => {
    if (element) {
      element.style.display = "none"; // ✅ Safe copy
    }
  };
}, [ref]); // Include ref in dependency array
```

---

## 🛠️ Git Workflow Guide

### Setup SSH Key (Recommended)

```bash
# 1. Generate SSH key
ssh-keygen -t ed25519 -C "your@email.com"
# Press Enter to accept default location (~/.ssh/id_ed25519)
# Enter passphrase (optional)

# 2. Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. Copy public key
cat ~/.ssh/id_ed25519.pub
# Paste in GitHub → Settings → SSH Keys

# 4. Test connection
ssh -T git@github.com
# Should see: "Hi username! You've successfully authenticated..."
```

### Branching Strategy

```bash
# Feature branch
git checkout -b feature/prize-pool-ui

# Bug fix branch
git checkout -b fix/hydration-mismatch

# Release branch
git checkout -b release/v1.0.0

# Commit with conventional message
git commit -m "feat: add prize pool card component"
git commit -m "fix: hydration mismatch in stars animation"
```

### Pushing to Remote

```bash
# First push (set upstream)
git push -u origin feature/prize-pool-ui

# Subsequent pushes
git push

# Force push (use with caution!)
git push --force-with-lease origin feature/prize-pool-ui
```

### Handling Large Commits

```bash
# If you get HTTP 400 error:
git config --global http.postBuffer 524288000

# Alternative: Push with compression
git push --force-with-lease \
  -o push-option=ci.skip

# Or increase timeout
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

---

## ✅ Code Quality Checks

### ESLint & Prettier

```bash
# Check for linting errors
yarn lint

# Fix linting errors (auto-fix)
yarn next:lint --fix

# Format code with Prettier
yarn prettier --write "packages/nextjs/app/**/*.tsx"

# Check TypeScript
yarn next:check-types
```

### Pre-commit Hooks (Husky)

```bash
# Already configured in package.json
# Automatically runs ESLint before commits

# To bypass hooks (only in emergency):
git commit --no-verify -m "emergency fix"
```

### Expected Output

```bash
$ yarn lint
# No errors should appear in output

$ yarn next:check-types
# ✓ No errors found in TypeScript

$ yarn prettier --check "packages/nextjs"
# All matched files use Prettier code style.
```

---

## 🚀 Build & Deployment Troubleshooting

### Build Errors

```bash
# Clean build
rm -rf packages/nextjs/.next
yarn clean
yarn build

# Incremental build with debug
yarn build --debug
```

### Local Development

```bash
# Start local blockchain
yarn chain

# Deploy contracts to local chain
yarn deploy

# Start dev server (separate terminal)
yarn start

# Should see:
# ⇒ http://localhost:3000
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
yarn vercel

# Production deploy
yarn vercel --prod
```

---

## 🔍 Debugging Tips

### Browser Console Debugging

```tsx
// Add console logs for debugging
useEffect(() => {
  console.log("Component mounted", { stars, count });

  return () => {
    console.log("Component unmounted");
  };
}, [stars, count]);

// Check hydration state
if (typeof window !== "undefined") {
  console.log("Client-side code");
}
```

### React DevTools

```bash
# Install React DevTools browser extension
# Helps inspect component props and state

# Key features:
- Component tree visualization
- Real-time prop/state changes
- Performance profiling
```

### Next.js Debug Mode

```bash
# Run with debug logging
NODE_DEBUG=next:* yarn dev

# Increase verbosity
DEBUG=* yarn dev
```

---

## 📦 Dependency Management

### Adding New Packages

```bash
# From root directory
yarn add package-name

# Dev dependency
yarn add -D package-name

# Specific workspace
yarn workspace @memepot/nextjs add package-name
```

### Updating Packages

```bash
# Check outdated packages
yarn outdated

# Update specific package
yarn upgrade package-name

# Update all
yarn upgrade-interactive
```

### Known Issues with Dependencies

```
⚠️ Alchemy RPC: 429 rate limits if free tier exceeded
→ Solution: Use your own RPC endpoint in scaffold.config.ts

⚠️ ReadDy.ai image domain: Occasionally slow
→ Solution: Consider cloudinary or other CDN for production

⚠️ Wagmi/RainbowKit version mismatches
→ Solution: Check package.json constraints, use exact versions
```

---

## 🧪 Testing & Validation Checklist

### Before Committing

- [ ] `yarn lint` passes (0 errors/warnings)
- [ ] `yarn next:check-types` passes
- [ ] `yarn next:build` completes without errors
- [ ] Manual testing in browser (no console errors)
- [ ] Responsive design checked (mobile, tablet, desktop)

### Before Merging to Main

- [ ] All ESLint checks pass
- [ ] TypeScript validation passing
- [ ] No hydration warnings in browser console
- [ ] Wallet connection works (manual connect only)
- [ ] Navigation works across all routes
- [ ] Git history is clean (no merge commits)

### Deployment Checklist

- [ ] Environment variables configured
- [ ] RPC endpoints tested
- [ ] Wallet configuration verified
- [ ] Image domains whitelisted
- [ ] Analytics configured
- [ ] Error tracking enabled (Sentry, etc.)

---

## 📚 Additional Resources

### Next.js Documentation

- [App Router Documentation](https://nextjs.org/docs/app)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

### React Patterns

- [React.use() for async components](https://react.dev/reference/react/use)
- [useEffect Best Practices](https://react.dev/reference/react/useEffect)
- [Hydration Troubleshooting](https://nextjs.org/docs/messages/react-hydration-error)

### Wagmi & RainbowKit

- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Customization](https://www.rainbowkit.com)

### Tailwind CSS

- [Tailwind CSS Docs](https://tailwindcss.com)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)

---

## 🤔 FAQ

**Q: Why do I get "Hydration mismatch" errors?**

A: This happens when the server renders different HTML than the client. Common causes:

- `Math.random()` in render
- `Date.now()` in render
- Browser-only APIs (`window`, `localStorage`)
- Different conditional logic

Solution: Move these to `useEffect` hooks.

---

**Q: How do I disable wallet auto-connect?**

A: Set `multiInjectedProviderDiscovery: false` in wagmiConfig.tsx:

```tsx
export const wagmiConfig = createConfig({
  multiInjectedProviderDiscovery: false,
  // ... other config
});
```

---

**Q: Can I use React Router with Next.js?**

A: Not recommended. Next.js App Router is the standard. If you need client-side routing:

- Use `next/link` for static links
- Use `useRouter()` from `next/navigation` for programmatic navigation

---

**Q: Where should I put API routes?**

A: Create them in `/app/api/route-name/route.ts`:

```tsx
// /app/api/prizes/route.ts
export async function GET() {
  return Response.json({ prizes: [...] });
}

// Access at: http://localhost:3000/api/prizes
```

---

**Q: How do I handle errors in production?**

A: Use Next.js error boundaries and error.tsx:

```tsx
// /app/error.tsx
"use client";
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## 📞 Support

For issues or questions:

1. Check this guide first
2. Review the README.md for architecture overview
3. Check ESLint warnings in VS Code
4. Run `yarn lint` and `yarn next:check-types`

---

**Last Updated:** 2024
**Version:** 1.0.0
