# Smart Gate: Seller Application System

Auto-scoring and tiered approval system for seller onboarding.

**Last Updated:** October 17, 2025
**Session:** 15 (Application Wizard Redesign)

---

## Overview

Smart Gate is an intelligent seller application review system that automatically calculates completeness scores, classifies applications into tiers, and flags applications for auto-approval. This reduces admin review burden while maintaining quality standards.

**Key Features:**

- **Auto-scoring** - 0-100% completeness based on fields filled
- **Tier classification** - starter/verified/certified based on completeness
- **Auto-approval eligibility** - Flags high-quality applications for fast-track
- **Structured data** - JSON-based eco-profile data for consistency

**Used by:**

- [Admin Dashboard](../areas/admin-dashboard.md#application-management) - Application review queue
- Seller application form - Multi-step wizard (Session 15)

**Related models:**

- [SellerApplication](../session-start/database_schema.md#sellerapplications) - Application model
- [Shop](../session-start/database_schema.md#shops) - Created after approval

---

## Database Schema

### SellerApplication Model

**File:** `schema.prisma`

```prisma
model SellerApplication {
  id                   String                @id @default(cuid())
  userId               String
  businessName         String
  businessEmail        String?               // Session 15
  businessWebsite      String?
  businessDescription  String
  businessAge          String?               // Session 15: "0-1", "1-3", "3-5", "5+"

  // Storefront Info (Session 15)
  storefronts          Json?                 // { online: boolean, physical: string[] }

  // Eco-Profile Data (Structured)
  shopEcoProfileData   Json?                 // Structured eco-profile
  ecoCommentary        Json?                 // Session 15: Category-specific commentary

  // Donation
  donationPercentage   Float                 @default(1.0)

  // Smart Gate Fields
  completenessScore    Int                   @default(0)  // 0-100
  tier                 String                @default("starter")  // starter | verified | certified
  autoApprovalEligible Boolean               @default(false)

  // Review Status
  status               SellerApplicationStatus @default(PENDING)
  rejectionReason      String?               // Educational feedback
  reviewedBy           String?               // Admin user ID
  reviewedAt           DateTime?

  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt

  user                 User                  @relation(...)

  @@index([userId])
  @@index([status])
  @@index([completenessScore])
  @@index([tier])
}

enum SellerApplicationStatus {
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
}
```

**See full model:** [database_schema.md#sellerapplications](../session-start/database_schema.md#sellerapplications)

### Key Fields (Session 15 Updates)

**Business Info:**

- `businessAge` - How long business has been operating
- `businessEmail` - Business contact email (separate from user email)
- `storefronts` (JSON) - Online/physical presence

**Example storefronts structure:**

```json
{
  "online": true,
  "physical": ["Seattle, WA", "Portland, OR"]
}
```

**Eco-Profile Data:**

- `shopEcoProfileData` (JSON) - Structured eco-profile (matches ShopEcoProfile fields)
- `ecoCommentary` (JSON) - Category-specific explanations

**Example shopEcoProfileData:**

```json
{
  "plasticFreePackaging": true,
  "organicMaterials": true,
  "fairTradeSourcing": false,
  "renewableEnergyPercent": 75
  // ... matches ShopEcoProfile fields
}
```

**Example ecoCommentary:**

```json
{
  "packaging": "We use 100% recycled cardboard and compostable packing peanuts...",
  "materials": "All materials sourced from certified organic suppliers...",
  "carbon": "We offset 100% of shipping emissions through..."
}
```

---

## Completeness Scoring

### Calculation Logic

**Fields weighted by importance:**

```typescript
const weights = {
  // Required fields (20%)
  businessName: 5,
  businessDescription: 10,
  donationPercentage: 5,

  // Business details (20%)
  businessEmail: 5,
  businessWebsite: 5,
  businessAge: 5,
  storefronts: 5,

  // Eco-profile data (50%)
  shopEcoProfileData: 30, // Based on fields filled
  ecoCommentary: 20, // Based on categories explained

  // Additional (10%)
  productSamples: 5,
  certifications: 5,
};
```

### Tier Classification

**Auto-assigned based on completeness:**

- **Starter** (0-59%) - Minimal information provided
- **Verified** (60-84%) - Good completeness
- **Certified** (85-100%) - Excellent completeness

### Auto-Approval Eligibility

**Criteria for auto-approval:**

1. Completeness score ≥ 75%
2. Tier = "verified" or "certified"
3. shopEcoProfileData includes at least 5 practices
4. businessAge ≥ "1-3 years"
5. donationPercentage ≥ 1%

**If all criteria met:** `autoApprovalEligible = true`

---

## Application Wizard (Session 15)

### Multi-Step Form

**Step 1: Business Basics**

- Business name
- Business email
- Business website (optional)
- Business description (mission, story)

**Step 2: Business Details**

- How long in business (businessAge)
- Online/physical storefronts
- Number of employees (optional)
- Annual revenue (optional)

**Step 3: Eco-Practices**

- Packaging practices (toggles)
- Material sourcing (toggles)
- Carbon & energy (toggles)
- Programs (take-back, repair, etc.)
- Category-specific commentary (ecoCommentary)

**Step 4: Nonprofit Partnership**

- Select nonprofit to support
- Set donation percentage (min 1%)
- Preview partnership

**Step 5: Review & Submit**

- Review all information
- Edit any step
- Accept terms
- Submit application

**Progress Indicator:**

- Visual stepper (1/5, 2/5, etc.)
- Completeness percentage updated live
- Save progress (draft mode)

---

## Admin Review Process

### Application Queue

**File:** `/src/app/admin/applications/applications-list.tsx` (346 lines)

**Features:**

- Status filtering (PENDING, UNDER_REVIEW, APPROVED, REJECTED)
- Sort by completeness score
- Sort by submission date
- Smart Gate indicators:
  - Completeness percentage badge
  - Tier badge (starter/verified/certified)
  - Auto-approval eligible flag (⚡ icon)

**See component:** [admin-dashboard.md#application-management-components](../areas/admin-dashboard.md#application-management-components)

### Review Interface

**Application Detail View:**

- All submitted information
- Completeness score and tier
- Auto-approval eligibility status
- Uploaded documents (certifications, samples)
- Structured eco-profile data display
- Eco-commentary by category

**Admin Actions:**

1. **Approve** - Grant seller access, create shop, initialize eco-profile
2. **Reject** - Deny application, provide educational feedback
3. **Request More Info** - Send back with questions

**Approval Workflow:**

```typescript
// On approval:
1. Update application status to APPROVED
2. Update user role (BUYER → SELLER) in database and Clerk
3. Create Shop record
4. Initialize ShopEcoProfile from shopEcoProfileData
5. Send approval email with next steps
```

**Rejection Workflow:**

```typescript
// On rejection:
1. Update application status to REJECTED
2. Set rejectionReason (educational feedback)
3. Send rejection email with reason and guidance
4. Allow reapplication after 30 days
```

---

## Server Actions

**File:** `/src/actions/seller-applications.ts` (would be created)

| Function                                    | Purpose                                  |
| ------------------------------------------- | ---------------------------------------- |
| `submitApplication(data)`                   | Submit new application with auto-scoring |
| `calculateCompleteness(data)`               | Calculate completeness score             |
| `determineT ier(score)`                     | Determine tier classification            |
| `checkAutoApprovalEligibility(data, score)` | Check auto-approval criteria             |
| `approveApplication(id)`                    | Approve and grant seller access          |
| `rejectApplication(id, reason)`             | Reject with feedback                     |
| `getApplicationById(id)`                    | Get application details                  |
| `getAllApplications(filters)`               | Admin view with filters                  |

---

## Migration Pattern

### From Application to Shop

**On approval, transfer data:**

```typescript
// 1. Create Shop
const shop = await db.shop.create({
  data: {
    userId: application.userId,
    name: application.businessName,
    slug: generateSlug(application.businessName),
    bio: application.businessDescription,
    nonprofitId: application.nonprofitId,
    donationPercentage: application.donationPercentage,
    verificationStatus: 'APPROVED',
  },
});

// 2. Initialize ShopEcoProfile from shopEcoProfileData
await db.shopEcoProfile.create({
  data: {
    shopId: shop.id,
    ...application.shopEcoProfileData, // Transfer practices
    completenessPercent: application.completenessScore,
    tier: application.tier,
  },
});

// 3. Update user role
await updateUserRole(application.userId, 'SELLER');
```

---

## Common Patterns & Gotchas

### Pattern 1: Structured Eco-Data

**Use structured JSON matching ShopEcoProfile fields:**

```typescript
// ✅ Correct - structured data
shopEcoProfileData: {
  plasticFreePackaging: true,
  organicMaterials: false,
  renewableEnergyPercent: 50,
  // ... matches ShopEcoProfile schema
}

// ❌ Wrong - unstructured data
ecoQuestions: {
  "Do you use plastic?": "No, we don't",
  "Any organic materials?": "Sometimes",
}
```

### Pattern 2: Auto-Approval is a Flag

**Auto-approval eligible doesn't mean auto-approved:**

```typescript
// Auto-approval eligibility is calculated but not executed automatically
// Admin still reviews, but sees ⚡ flag for priority/fast-track
if (autoApprovalEligible) {
  console.log('✅ High-quality application, recommend fast-track');
}
```

### Pattern 3: Completeness vs Quality

**Score measures completeness, not quality:**

```typescript
// High completeness (90%) = seller filled out most fields
// Doesn't mean practices are "good", just disclosed
// Admin still evaluates quality of practices
```

### Pattern 4: Rejection Feedback

**Provide educational feedback, not just rejection:**

```typescript
// ✅ Correct - educational
rejectionReason: 'Your eco-profile completeness is 35%. Please provide more details about your packaging materials, sourcing practices, and carbon reduction efforts. Visit our seller guide for examples.';

// ❌ Wrong - not helpful
rejectionReason: 'Insufficient information';
```

---

## Implementation Status

### ✅ Fully Implemented (Session 15)

- Application wizard with 5 steps
- Business age field
- Storefronts JSON structure
- Eco-commentary JSON structure
- Completeness score calculation
- Tier classification
- Auto-approval eligibility flagging
- Admin review interface with Smart Gate indicators
- Approval/rejection workflow
- Email notifications

### 📋 Not Yet Implemented

- Reapplication system (30-day cooldown)
- Application versioning (track changes)
- Admin notes and internal comments
- Application analytics (approval rate, avg completeness)
- Automated reminders for incomplete applications
- Batch approval for auto-eligible applications

---

## Testing Checklist

### Application Submission

- [ ] Submit minimal application (starter tier, low score)
- [ ] Submit good application (verified tier, mid score)
- [ ] Submit excellent application (certified tier, high score, auto-eligible)
- [ ] Verify completeness score calculated correctly
- [ ] Verify tier assigned correctly
- [ ] Verify auto-approval flag set correctly

### Admin Review

- [ ] View application queue
- [ ] Filter by status
- [ ] Sort by completeness score
- [ ] View application detail with all data
- [ ] Approve application
- [ ] Verify shop created
- [ ] Verify eco-profile initialized
- [ ] Verify user role updated (database + Clerk)
- [ ] Reject application with feedback
- [ ] Verify rejection email sent

### Edge Cases

- [ ] Submit application with no eco-profile data
- [ ] Submit application with invalid donation percentage
- [ ] Approve application twice (should fail)
- [ ] Edit approved application (should fail)

---

**Related Documentation:**

- [Admin Dashboard - Application Review](../areas/admin-dashboard.md#application-management-components)
- [Eco Impact V2 - Shop Eco-Profile](./eco-impact-v2.md#shop-eco-profile)
- [Database Schema - SellerApplication](../session-start/database_schema.md#sellerapplications)
- [Database Schema - Shop](../session-start/database_schema.md#shops)
