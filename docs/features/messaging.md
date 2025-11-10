# Messaging System

Complete reference for buyer-seller messaging with text and image support.

**Last Updated:** November 2025 (Session 22: Routes moved to /account/messages for buyer)

---

## Overview

The messaging system enables direct communication between buyers and sellers with support for text messages and image attachments. Messages are organized into conversations for efficient inbox management.

**Key Features:**

- Conversation-based messaging (grouped by participants)
- Text messages (up to 2000 characters)
- Image attachments (up to 3 per message, 4MB each)
- Order context linking
- Unread count tracking with badge display
- Real-time read status updates
- Lightbox image viewer with navigation
- Multiple entry points across the platform

**Related Documentation:**

- [Database Schema](../session-start/database_schema.md#conversations) - Conversation and Message models
- [Buyer Experience](../areas/buyer-experience.md#messaging-auth-required) - Buyer messaging routes
- [Seller Dashboard](../areas/seller-dashboard.md#messaging) - Seller messaging routes
- [UploadThing Setup](../setup/UPLOADTHING_SETUP.md#message-images-session-19) - Image upload configuration

---

## Database Models

### Conversation

Groups messages between two participants with metadata for efficient inbox queries.

```prisma
model Conversation {
  id                       String    @id @default(cuid())
  participant1Id           String
  participant2Id           String
  lastMessageAt            DateTime  @default(now())
  lastMessagePreview       String?
  participant1UnreadCount  Int       @default(0)
  participant2UnreadCount  Int       @default(0)
  createdAt                DateTime  @default(now())
  updatedAt                DateTime  @updatedAt

  participant1             User      @relation(...)
  participant2             User      @relation(...)
  messages                 Message[]

  @@unique([participant1Id, participant2Id])
  @@index([participant1Id, participant2Id, lastMessageAt])
}
```

**Design Rationale:**

- **Two-model approach:** Separates conversation metadata from messages for optimized queries
- **Unique constraint:** Prevents duplicate conversations between same participants
- **Unread counts:** Stored per participant for fast badge queries without scanning messages
- **Last message preview:** Enables inbox list without joining messages table

### Message

Individual messages with text and/or image attachments.

```prisma
model Message {
  id                            String        @id @default(cuid())
  conversationId                String
  fromUserId                    String
  toUserId                      String
  orderId                       String?
  subject                       String?
  body                          String
  attachments                   String[]
  isRead                        Boolean       @default(false)
  createdAt                     DateTime      @default(now())

  conversation                  Conversation  @relation(...)
  User_Message_fromUserIdToUser User          @relation(...)
  User_Message_toUserIdToUser   User          @relation(...)

  @@index([conversationId, createdAt, fromUserId, toUserId, isRead, orderId])
}
```

**Key Fields:**

- `body` - Text content (can be empty string if attachments present)
- `attachments` - Array of UploadThing image URLs (max 3)
- `orderId` - Optional order context for linking messages to specific transactions
- `conversationId` - Cascades on delete (removing conversation removes all messages)

---

## Page Routes

### Buyer Routes (Session 22: Moved to /account/messages)

| Route                        | File                                          | Lines | Description                    |
| ---------------------------- | --------------------------------------------- | ----- | ------------------------------ |
| `/account/messages`          | `/src/app/account/messages/page.tsx`          | 152   | Buyer inbox with conversations |
| `/account/messages/[userId]` | `/src/app/account/messages/[userId]/page.tsx` | 113   | Thread with specific seller    |

**Features:**

- Integrated into account layout with persistent sidebar navigation
- Unread count badge in account nav and header
- Recent messages preview on account dashboard
- Responsive design (mobile + desktop)
- Old routes redirect: `/messages` → `/account/messages`

### Seller Routes

| Route                       | File                                         | Lines | Description                |
| --------------------------- | -------------------------------------------- | ----- | -------------------------- |
| `/seller/messages`          | `/src/app/seller/messages/page.tsx`          | ~150  | Seller inbox with buyers   |
| `/seller/messages/[userId]` | `/src/app/seller/messages/[userId]/page.tsx` | ~100  | Thread with specific buyer |

**Features:**

- Seller dashboard layout integration
- Same components as buyer (ConversationsList, ConversationThread)
- Unread count in seller header

---

## Components

### ConversationsList

**File:** `/src/components/messages/conversations-list.tsx`

**Purpose:** Inbox view displaying all conversations sorted by most recent activity.

**Props:**

```typescript
interface ConversationsListProps {
  conversations: Array<{
    id: string;
    otherParticipant: {
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
      shop?: {
        name: string;
        logo: string | null;
        slug: string;
      } | null;
    };
    lastMessageAt: Date;
    lastMessagePreview: string | null;
    unreadCount: number;
  }>;
  currentPath: string;
}
```

**Features:**

- Participant avatar (user or shop logo)
- Display name (shop name or user name/email)
- Last message preview (truncated text or "📷 Sent N images")
- Unread count badge (eco green #52B788)
- Timestamp (relative, e.g., "2 hours ago")
- Active state highlighting
- Empty state for no conversations

### ConversationThread

**File:** `/src/components/messages/conversation-thread.tsx`

**Purpose:** Message thread display with auto-scroll and date grouping.

**Props:**

```typescript
interface ConversationThreadProps {
  messages: Message[];
  currentUserId: string;
  otherUserId: string;
}
```

**Features:**

- Date separators (e.g., "Today", "Yesterday", "Jan 15")
- Auto-scroll to bottom on mount and new messages
- Empty state for new conversations
- MessageBubble components for each message
- MessageComposer at bottom (sticky)

### MessageBubble

**File:** `/src/components/messages/message-bubble.tsx`

**Purpose:** Individual message display with images and metadata.

**Props:**

```typescript
interface MessageBubbleProps {
  message: {
    id: string;
    body: string;
    createdAt: Date;
    fromUserId: string;
    orderId?: string | null;
    attachments: string[];
    User_Message_fromUserIdToUser: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
  };
  currentUserId: string;
}
```

**Layout:**

- **Sent messages:** Right-aligned, forest green background (#1B4332), white text
- **Received messages:** Left-aligned, neutral gray background (#F1F3F5), dark text
- **Image placement:** Images ABOVE text (messaging best practice)
- **Grid layout:**
  - 1 image: Full width at 4:3 aspect ratio
  - 2 images: Side-by-side 2-column grid
  - 3 images: First image full width, next two side-by-side below

**Features:**

- Avatar display (sender)
- Click images to open lightbox
- Order link badge (blue, links to `/orders/[id]`)
- Relative timestamp (e.g., "5 minutes ago")
- Rounded corners matching message bubble style

### MessageComposer

**File:** `/src/components/messages/message-composer.tsx`

**Purpose:** Send messages with text and/or image attachments.

**Props:**

```typescript
interface MessageComposerProps {
  toUserId: string;
  orderId?: string;
  onMessageSent?: () => void;
  placeholder?: string;
}
```

**Features:**

- Textarea with auto-resize (min 44px, max 200px)
- Character count (max 2000, warning when approaching limit)
- Image upload button (UploadThing integration)
- Image preview thumbnails (80x80px with remove button)
- Upload progress indicator
- Send button (disabled when empty and no images)
- Keyboard shortcuts:
  - Enter: Send message
  - Shift+Enter: New line
- Error state display
- Loading state during upload/send

**Image Upload:**

- Click image icon to select files
- Max 3 images per message
- Max 4MB per image
- Preview before sending
- Remove individual images
- Upload happens BEFORE sending (not after)

### ImageLightbox

**File:** `/src/components/messages/image-lightbox.tsx`

**Purpose:** Full-screen image viewer with navigation.

**Props:**

```typescript
interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}
```

**Features:**

- Full-screen overlay (black 90% opacity)
- Large image display (90vw x 90vh, object-contain)
- Navigation arrows (prev/next)
- Keyboard support:
  - Left/Right arrows: Navigate images
  - Escape: Close lightbox
- Image counter (e.g., "2 / 3")
- Close button (top-right)
- Click overlay to close
- Portal rendering (appended to body)
- Body scroll lock while open

### MarkReadHandler

**File:** `/src/components/messages/mark-read-handler.tsx`

**Purpose:** Client-side component to mark conversation as read after page load.

**Props:**

```typescript
interface MarkReadHandlerProps {
  conversationId: string;
}
```

**Implementation:**

```typescript
useEffect(() => {
  const markAsRead = async () => {
    await markConversationAsRead(conversationId);
    router.refresh();
  };
  markAsRead();
}, [conversationId, router]);
```

**Rationale:**

- Avoids calling `revalidatePath` during SSR (causes Next.js 15 error)
- Marks conversation as read on client after mount
- Refreshes router to update unread counts in header
- Returns `null` (no visual render)

---

## Server Actions

**File:** `/src/actions/messages.ts` (465 lines)

### getConversations()

Fetch all conversations for current user with metadata.

**Returns:**

```typescript
{
  success: true,
  conversations: Array<{
    id: string;
    otherParticipant: {
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
      shop?: {
        id: string;
        name: string;
        logo: string | null;
        slug: string;
      } | null;
    };
    lastMessageAt: Date;
    lastMessagePreview: string | null;
    unreadCount: number;
    createdAt: Date;
  }>;
}
```

**Query Optimization:**

- Joins participant1 and participant2 with shop data
- Selects only needed fields (not full user object)
- Orders by `lastMessageAt DESC`
- Returns formatted "otherParticipant" based on current user

### getConversation(otherUserId)

Get or create conversation with another user, including all messages.

**Input:** `otherUserId: string`

**Returns:**

```typescript
{
  success: true,
  conversation: {
    id: string;
    otherParticipant: {
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
      shop?: {
        id: string;
        name: string;
        logo: string | null;
        slug: string;
      } | null;
    };
    messages: Message[];
  };
}
```

**Behavior:**

- Checks both directions: `(user1, user2)` and `(user2, user1)`
- Creates conversation if doesn't exist (participant1 = current user, participant2 = other user)
- Includes all messages ordered by `createdAt ASC`

### sendMessage(input)

Send text and/or image message, creating conversation if needed.

**Input:**

```typescript
{
  toUserId: string;
  body: string;              // Can be empty if attachments present
  orderId?: string;          // Optional order context
  subject?: string;
  attachments?: string[];    // Image URLs from UploadThing
}
```

**Returns:**

```typescript
{
  success: true,
  message: Message;
}
```

**Validation:**

- Requires either `body` OR `attachments` (at least one must be present)
- Body max 2000 characters
- Verifies recipient exists
- Syncs current user to database

**Logic:**

1. Find or create conversation
2. Create message with conversation link
3. Update conversation:
   - `lastMessageAt` = now
   - `lastMessagePreview` = body preview or "📷 Sent N images"
   - Increment recipient's unread count
4. Revalidate paths: `/messages`, `/messages/[userId]`, `/seller/messages`, `/seller/messages/[userId]`

**Preview Generation:**

```typescript
const preview = hasText
  ? input.body.substring(0, 100)
  : hasAttachments
    ? `📷 Sent ${input.attachments!.length} image${input.attachments!.length > 1 ? 's' : ''}`
    : '';
```

### markConversationAsRead(conversationId)

Mark all messages in conversation as read for current user.

**Input:** `conversationId: string`

**Returns:**

```typescript
{
  success: true;
}
```

**Logic:**

1. Verify user is participant
2. Update all unread messages TO current user: `isRead = true`
3. Reset user's unread count in conversation: `participant1UnreadCount = 0` or `participant2UnreadCount = 0`
4. **Does NOT call revalidatePath** (caller handles via router.refresh())

### getUnreadCount()

Get total unread message count for current user (for header badge).

**Returns:**

```typescript
{
  success: true,
  count: number;
}
```

**Query:**

- Fetches all conversations where user is participant
- Sums up user's unread count across all conversations
- Returns total for badge display

### getOrderMessages(orderId)

Get all messages related to specific order (for order detail page).

**Input:** `orderId: string`

**Returns:**

```typescript
{
  success: true,
  messages: Message[];
}
```

**Authorization:**

- Verifies user is buyer OR seller for the order
- Buyer: `order.buyerId === userId`
- Seller: `order.items.some(item => item.shop.userId === userId)`

---

## Entry Points

Multiple entry points across the platform allow users to initiate conversations:

### Product Detail Pages

**Location:** `/src/app/products/[id]/product-info-client.tsx`

**Button:** "Contact" button next to seller info

**Code:**

```typescript
{isLoaded && isSignedIn && user?.id !== product.shop.userId && (
  <Button variant="outline" size="sm" asChild>
    <Link href={`/messages/${product.shop.userId}`}>
      <MessageCircle className="mr-2 size-4" />
      Contact
    </Link>
  </Button>
)}
```

### Shop Pages

**Location:** `/src/components/shop/shop-hero.tsx`

**Button:** "Contact Shop Owner" button in hero section

**Code:**

```typescript
{showContactButton && (
  <Button variant="outline" size="sm" asChild>
    <Link href={`/messages/${userId}`}>
      <MessageCircle className="mr-2 size-4" />
      Contact Shop Owner
    </Link>
  </Button>
)}
```

### Product Cards

**Location:** `/src/components/eco/product-card.tsx`

**Icon:** MessageCircle icon on hover next to seller name

**Code:**

```typescript
{showContactButton && (
  <Link
    href={`/messages/${seller.userId}`}
    className="opacity-0 transition-opacity hover:text-[#2D6A4F] group-hover:opacity-100"
    title="Contact Seller"
  >
    <MessageCircle className="size-3.5" />
  </Link>
)}
```

### Order Detail Pages

**Location:** `/src/app/orders/[id]/page.tsx`

**Button:** "Message Seller" button per order item

**Code:**

```typescript
<Button variant="outline" size="sm" asChild>
  <Link href={`/messages/${item.shop.userId}?orderId=${order.id}`}>
    <MessageCircle className="mr-2 size-4" />
    Message Seller
  </Link>
</Button>
```

**Note:** Order context is passed via query param (can be used for pre-filling subject)

---

## Image Messaging Implementation

### UploadThing Route

**File:** `/src/app/api/uploadthing/core.ts`

**Route:** `messageImage`

**Configuration:**

```typescript
messageImage: f({ image: { maxFileSize: '4MB', maxFileCount: 3 } })
  .middleware(async () => {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');
    return { userId };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    console.log('Message image uploaded for userId:', metadata.userId);
    return { uploadedBy: metadata.userId, url: file.url };
  });
```

### Upload Flow

1. User clicks image icon in MessageComposer
2. File input opens (hidden input element)
3. User selects 1-3 images
4. Images upload via UploadThing (with loading spinner)
5. URLs stored in component state
6. Thumbnails preview in composer (80x80px with remove button)
7. User clicks Send
8. `sendMessage()` action called with `attachments` array
9. Message created with image URLs
10. Images display in MessageBubble with grid layout

### Image Display Grid

**1 Image:**

```tsx
<div className="grid grid-cols-2 gap-2" style={{ width: '300px' }}>
  <button className="col-span-2" style={{ aspectRatio: '4/3' }}>
    <Image src={url} fill className="object-cover" />
  </button>
</div>
```

**2 Images:**

```tsx
<div className="grid grid-cols-2 gap-2" style={{ width: '300px' }}>
  <button className="col-span-1" style={{ aspectRatio: '1/1' }}>
    <Image src={url1} fill className="object-cover" />
  </button>
  <button className="col-span-1" style={{ aspectRatio: '1/1' }}>
    <Image src={url2} fill className="object-cover" />
  </button>
</div>
```

**3 Images:**

```tsx
<div className="grid grid-cols-2 gap-2" style={{ width: '300px' }}>
  <button className="col-span-2" style={{ aspectRatio: '1/1' }}>
    <Image src={url1} fill className="object-cover" />
  </button>
  <button className="col-span-1" style={{ aspectRatio: '1/1' }}>
    <Image src={url2} fill className="object-cover" />
  </button>
  <button className="col-span-1" style={{ aspectRatio: '1/1' }}>
    <Image src={url3} fill className="object-cover" />
  </button>
</div>
```

---

## UX Design Decisions

### Color Scheme

- **Sent messages:** Forest green `#1B4332` (matches platform eco-theme)
- **Received messages:** Neutral gray `#F1F3F5` (clean, minimal)
- **Unread badge:** Eco green `#52B788` (consistent with platform)

### Layout Best Practices

- **Images above text:** Industry standard (WhatsApp, Messenger, iMessage)
- **Avatar on outside:** Sender avatar outside bubble (not inside)
- **Timestamps below:** Subtle, relative time (e.g., "5m ago")
- **Right-aligned sent:** User's messages on right, consistent with expectations

### Accessibility

- **Alt text:** Images have descriptive alt attributes
- **Keyboard navigation:** Lightbox supports arrow keys and ESC
- **Focus management:** Textarea autofocus on mount
- **Screen reader labels:** Buttons have `aria-label` attributes
- **Color contrast:** Meets WCAG AA standards

---

## Performance Optimizations

### Conversation-Based Architecture

**Problem:** Scanning messages table for inbox queries is expensive.

**Solution:** Store metadata in Conversation model:

- `lastMessageAt` - Sort inbox without joining messages
- `lastMessagePreview` - Show preview without querying messages
- `participant1UnreadCount`, `participant2UnreadCount` - Badge counts without counting messages

**Result:** Inbox query is single table scan with joins only for user/shop data.

### Unread Count Tracking

**Problem:** Counting unread messages on every request is expensive.

**Solution:** Store counts in Conversation model:

- Increment on `sendMessage()` (recipient's count)
- Reset on `markConversationAsRead()` (user's count)
- Sum counts across conversations for badge

**Result:** Badge query is simple aggregation, no message scanning.

### Client-Side Read Marking

**Problem:** Next.js 15 forbids `revalidatePath` during SSR.

**Solution:** Move read marking to client component:

- MarkReadHandler mounts on thread page
- Calls `markConversationAsRead()` in useEffect
- Calls `router.refresh()` to update counts
- Server action doesn't call revalidatePath

**Result:** No SSR errors, unread counts update correctly.

---

## Common Patterns

### Creating Conversation from Product Page

```typescript
// Product detail page button
<Link href={`/messages/${product.shop.userId}`}>
  Contact Seller
</Link>

// Thread page server component
const { userId: otherUserId } = await params;
const result = await getConversation(otherUserId);

// getConversation creates if doesn't exist
if (!conversation) {
  conversation = await db.conversation.create({
    data: {
      participant1Id: userId,
      participant2Id: otherUserId,
      lastMessageAt: new Date(),
    },
  });
}
```

### Sending Image-Only Message

```typescript
// MessageComposer validates
if (!message.trim() && uploadedImages.length === 0) {
  return; // Can't send empty
}

// sendMessage allows empty body if attachments
const result = await sendMessage({
  toUserId,
  body: '', // Empty is OK
  attachments: uploadedImages, // Must have images
});

// Preview generation
const preview = hasText
  ? input.body.substring(0, 100)
  : hasAttachments
    ? `📷 Sent ${input.attachments!.length} image${input.attachments!.length > 1 ? 's' : ''}`
    : '';
```

### Displaying Unread Badge

```typescript
// SiteHeaderWrapper (server component)
const conversations = await db.conversation.findMany({
  where: {
    OR: [{ participant1Id: userId }, { participant2Id: userId }],
  },
  select: {
    participant1Id: true,
    participant2Id: true,
    participant1UnreadCount: true,
    participant2UnreadCount: true,
  },
});

const unreadCount = conversations.reduce((sum, conv) => {
  const isParticipant1 = conv.participant1Id === userId;
  return sum + (isParticipant1 ? conv.participant1UnreadCount : conv.participant2UnreadCount);
}, 0);

// SiteHeader (client component)
<Button variant="ghost" size="icon" asChild className="relative">
  <Link href="/messages">
    <MessageCircle className="size-5" />
    {unreadCount > 0 && (
      <span className="bg-[#52B788] absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
        {unreadCount}
      </span>
    )}
  </Link>
</Button>
```

---

## Future Enhancements

### Not Yet Implemented

- Real-time updates (WebSockets/Pusher for live message delivery)
- Read receipts (show when recipient reads message)
- Typing indicators
- Message editing
- Message deletion
- Archive conversations
- Search messages
- Email notifications for new messages
- Push notifications (mobile)
- File attachments (PDFs, etc.)
- Voice messages
- Video messages
- Message reactions (emoji)
- Message threads/replies
- Admin moderation tools (view/delete inappropriate messages)

### Potential Improvements

- Pagination for message history (currently loads all messages)
- Lazy loading images in thread
- Message caching (reduce re-fetching)
- Optimistic UI updates (show message immediately, sync later)
- Message retry logic (if send fails)
- Offline support (queue messages when offline)
- Message templates (pre-written responses for sellers)
- Auto-responders (seller away message)

---

## Troubleshooting

### Images Not Uploading

**Symptoms:** Upload button shows loading forever, no thumbnails appear

**Causes:**

- UploadThing API keys not configured
- File size exceeds 4MB
- More than 3 images selected
- Invalid image format

**Solutions:**

- Check `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` in `.env`
- Restart dev server after adding env vars
- Verify file sizes (use image compression if needed)
- Ensure files are JPG, PNG, WebP, or GIF

### Unread Counts Not Updating

**Symptoms:** Badge shows old count after reading messages

**Causes:**

- MarkReadHandler not mounting
- Router not refreshing
- Server action failing silently

**Solutions:**

- Verify MarkReadHandler is included in thread page
- Check browser console for errors
- Test `markConversationAsRead()` directly
- Verify router.refresh() is being called

### Messages Not Sending

**Symptoms:** Send button shows loading, error appears

**Causes:**

- Validation failure (empty body and no images)
- Character limit exceeded (>2000)
- Recipient user not found
- Network error

**Solutions:**

- Check error message in composer
- Verify recipient user exists in database
- Ensure at least body OR attachments provided
- Check browser network tab for failed requests

### Lightbox Not Opening

**Symptoms:** Clicking image does nothing

**Causes:**

- Portal not rendering to body
- Z-index conflict
- Event handler not attached

**Solutions:**

- Check browser console for React portal errors
- Verify lightbox z-index (`z-50`) is higher than other overlays
- Test click handler on image button element

---

## Testing Checklist

### Core Messaging Flow

- [ ] Buyer can send text message to seller
- [ ] Seller receives message in inbox
- [ ] Unread count badge shows in header
- [ ] Clicking conversation opens thread
- [ ] Messages display in correct order (chronological)
- [ ] Read status updates when opening thread
- [ ] Unread badge clears after reading

### Image Messaging

- [ ] Can upload 1 image
- [ ] Can upload 3 images (max)
- [ ] Cannot upload 4+ images (validation)
- [ ] Thumbnails preview before sending
- [ ] Can remove images before sending
- [ ] Can send image without text
- [ ] Cannot send empty (no text, no images)
- [ ] Images display in correct grid layout
- [ ] Clicking image opens lightbox
- [ ] Lightbox navigation works (arrows, keyboard)
- [ ] Lightbox closes on ESC or overlay click

### Entry Points

- [ ] Contact button on product detail page works
- [ ] Contact Shop Owner button on shop page works
- [ ] MessageCircle icon on product cards works
- [ ] Message Seller button on order detail works
- [ ] All buttons redirect to correct thread

### Edge Cases

- [ ] New user with no conversations sees empty state
- [ ] Long messages wrap correctly
- [ ] Very long names truncate
- [ ] Missing avatars show fallback (initials)
- [ ] Order context links to correct order
- [ ] Multiple conversations sort by most recent
- [ ] Timestamps update relative to current time

---

## Related Documentation

- [Database Schema](../session-start/database_schema.md#conversations)
- [Buyer Experience](../areas/buyer-experience.md#messaging-auth-required)
- [Seller Dashboard](../areas/seller-dashboard.md#messaging)
- [UploadThing Setup](../setup/UPLOADTHING_SETUP.md#message-images-session-19)
