# Evercraft Documentation

**Last Updated:** October 8, 2025

This documentation is organized for optimal AI agent onboarding and reference.

---

## 📁 Folder Structure

### `/session-start/` ⭐ **START HERE**

**When to read:** Beginning of EVERY development session

**Contains:**

- `CURRENT_STATUS.md` - Where you are now, what was done last session, what's next
- `CODEBASE_MAP.md` - Comprehensive reference of all existing features, files, and implementations

**Prompt:** `"Read everything in /docs/session-start"`

---

### `/reference/` 📚 **DEVELOPMENT REFERENCE**

**When to read:** During active development, when writing queries or adding dependencies

**Contains:**

- `DATABASE_SCHEMA.md` - All Prisma models, relationships, fields, and schema notes
- `TECH_STACK.md` - Technology versions, package details, integration status

**Prompt:** `"Also read /docs/reference"` or `"Read reference/DATABASE_SCHEMA.md"`

---

### `/planning/` 🎯 **STRATEGIC CONTEXT**

**When to read:** Starting new phases, making architectural decisions, designing UX flows

**Contains:**

- `PROJECT_PLAN.md` - Overall vision, all 20 phases, feature roadmap, MVP scope
- `DESIGN_SYSTEM.md` - UI components, design tokens, styling patterns, accessibility
- `UX_RESEARCH.md` - User personas, journey maps, competitive analysis (900+ lines)

**Prompt:** `"Also read /docs/planning"` or specific file as needed

---

### `/setup/` ⚙️ **INTEGRATION GUIDES**

**When to read:** Working on specific integrations (auth, payments, email, shipping, uploads)

**Contains:**

- `CLERK_SETUP.md` - Authentication setup and configuration
- `STRIPE_SETUP.md` - Payment processing and Stripe Connect
- `RESEND_SETUP.md` - Email service configuration
- `UPLOADTHING_SETUP.md` - File upload setup
- `SHIPPING_CALCULATOR.md` - Shippo integration details

**Prompt:** `"Read setup/STRIPE_SETUP.md"` (specific file as needed)

---

## 🚀 Quick Start Prompts

### Standard Development Session

```
Read everything in /docs/session-start
```

Use this for 90% of sessions. Gives you current status and full codebase map.

### Database-Heavy Work

```
Read everything in /docs/session-start and /docs/reference
```

Adds schema details and tech stack for complex queries.

### Starting a New Phase

```
Read everything in /docs/session-start and /docs/planning
```

Adds project plan, design system, and UX research for architectural decisions.

### Working on Specific Integration

```
Read everything in /docs/session-start and /docs/setup/STRIPE_SETUP.md
```

Adds integration-specific setup guide as needed.

### Full Context (Rare)

```
Read everything in /docs/session-start, /docs/reference, and /docs/planning
```

Use for major architectural decisions or cross-cutting changes.

---

## 📋 Documentation Maintenance

### After Each Session

Update `session-start/CURRENT_STATUS.md`:

- Add session summary to history
- Update phase completion percentages
- Document bugs fixed or features added
- Update "Next Steps" section

### After Major Features

Update `session-start/CODEBASE_MAP.md`:

- Add new pages/routes
- Add new server actions
- Update file statistics
- Add to "What's Built" section

### When Adding Integrations

Create or update relevant file in `/setup/`

---

## 🎯 Context Budget Management

**Recommended session restart triggers:**

1. After 2-3 context compactions
2. After completing major phase milestones
3. When switching to completely different feature areas
4. When noticing increased errors or slower responses

This folder structure makes session restarts seamless - just read `/session-start/` and continue where you left off.

---

**Happy building! 🚀**
