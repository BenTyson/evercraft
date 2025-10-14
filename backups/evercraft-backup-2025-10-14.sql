--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: bentyson
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ApplicationStatus" OWNER TO bentyson;

--
-- Name: DonationStatus; Type: TYPE; Schema: public; Owner: bentyson
--

CREATE TYPE public."DonationStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED'
);


ALTER TYPE public."DonationStatus" OWNER TO bentyson;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: bentyson
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO bentyson;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: bentyson
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO bentyson;

--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: bentyson
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'SOLD_OUT',
    'ARCHIVED'
);


ALTER TYPE public."ProductStatus" OWNER TO bentyson;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: bentyson
--

CREATE TYPE public."Role" AS ENUM (
    'BUYER',
    'SELLER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO bentyson;

--
-- Name: SupportTicketStatus; Type: TYPE; Schema: public; Owner: bentyson
--

CREATE TYPE public."SupportTicketStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."SupportTicketStatus" OWNER TO bentyson;

--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: bentyson
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."VerificationStatus" OWNER TO bentyson;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    company text,
    address1 text NOT NULL,
    address2 text,
    city text NOT NULL,
    state text NOT NULL,
    "postalCode" text NOT NULL,
    country text DEFAULT 'US'::text NOT NULL,
    phone text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Address" OWNER TO bentyson;

--
-- Name: AnalyticsEvent; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."AnalyticsEvent" (
    id text NOT NULL,
    "userId" text,
    "shopId" text,
    "eventType" text NOT NULL,
    "eventData" jsonb NOT NULL,
    "sessionId" text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AnalyticsEvent" OWNER TO bentyson;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    "parentId" text,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    "metaTitle" text,
    "metaDescription" text,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO bentyson;

--
-- Name: Certification; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Certification" (
    id text NOT NULL,
    "productId" text,
    "shopId" text,
    name text NOT NULL,
    type text NOT NULL,
    "issuedBy" text NOT NULL,
    "issuedDate" timestamp(3) without time zone,
    "expiryDate" timestamp(3) without time zone,
    certificate text,
    verified boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "verifiedBy" text
);


ALTER TABLE public."Certification" OWNER TO bentyson;

--
-- Name: Collection; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Collection" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    description text,
    "isPublic" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Collection" OWNER TO bentyson;

--
-- Name: CollectionProduct; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."CollectionProduct" (
    id text NOT NULL,
    "collectionId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CollectionProduct" OWNER TO bentyson;

--
-- Name: Donation; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Donation" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "nonprofitId" text NOT NULL,
    "shopId" text,
    amount double precision NOT NULL,
    status public."DonationStatus" DEFAULT 'PENDING'::public."DonationStatus" NOT NULL,
    "payoutId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Donation" OWNER TO bentyson;

--
-- Name: Favorite; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Favorite" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Favorite" OWNER TO bentyson;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "fromUserId" text NOT NULL,
    "toUserId" text NOT NULL,
    "orderId" text,
    subject text,
    body text NOT NULL,
    attachments text[],
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Message" OWNER TO bentyson;

--
-- Name: Nonprofit; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Nonprofit" (
    id text NOT NULL,
    name text NOT NULL,
    ein text NOT NULL,
    mission text NOT NULL,
    description text,
    category text[],
    logo text,
    images text[],
    website text,
    "socialLinks" jsonb,
    "isVerified" boolean DEFAULT false NOT NULL,
    "stripeAccountId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Nonprofit" OWNER TO bentyson;

--
-- Name: NotificationPreference; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."NotificationPreference" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "emailMarketing" boolean DEFAULT false NOT NULL,
    "emailOrderUpdates" boolean DEFAULT true NOT NULL,
    "emailMessages" boolean DEFAULT true NOT NULL,
    "emailReviews" boolean DEFAULT true NOT NULL,
    "pushNotifications" boolean DEFAULT false NOT NULL,
    "smsNotifications" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."NotificationPreference" OWNER TO bentyson;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "buyerId" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PROCESSING'::public."OrderStatus" NOT NULL,
    subtotal double precision NOT NULL,
    "shippingCost" double precision DEFAULT 0 NOT NULL,
    tax double precision DEFAULT 0 NOT NULL,
    total double precision NOT NULL,
    "nonprofitDonation" double precision DEFAULT 0 NOT NULL,
    "shippingAddress" jsonb NOT NULL,
    "billingAddress" jsonb NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paymentIntentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "shippingLabelUrl" text,
    "shippoTransactionId" text,
    "trackingCarrier" text,
    "trackingNumber" text
);


ALTER TABLE public."Order" OWNER TO bentyson;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    "shopId" text NOT NULL,
    quantity integer NOT NULL,
    "priceAtPurchase" double precision NOT NULL,
    subtotal double precision NOT NULL,
    "nonprofitId" text,
    "donationAmount" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO bentyson;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "stripePaymentIntentId" text NOT NULL,
    amount double precision NOT NULL,
    "platformFee" double precision NOT NULL,
    "sellerPayout" double precision NOT NULL,
    "nonprofitDonation" double precision NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Payment" OWNER TO bentyson;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    "compareAtPrice" double precision,
    sku text,
    "categoryId" text,
    tags text[],
    status public."ProductStatus" DEFAULT 'DRAFT'::public."ProductStatus" NOT NULL,
    "ecoScore" integer,
    "ecoAttributes" jsonb,
    "metaTitle" text,
    "metaDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "inventoryQuantity" integer DEFAULT 0 NOT NULL,
    "lowStockThreshold" integer,
    "trackInventory" boolean DEFAULT true NOT NULL,
    "hasVariants" boolean DEFAULT false NOT NULL,
    "variantOptions" jsonb
);


ALTER TABLE public."Product" OWNER TO bentyson;

--
-- Name: ProductEcoProfile; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."ProductEcoProfile" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "isOrganic" boolean DEFAULT false NOT NULL,
    "isRecycled" boolean DEFAULT false NOT NULL,
    "isBiodegradable" boolean DEFAULT false NOT NULL,
    "isVegan" boolean DEFAULT false NOT NULL,
    "isFairTrade" boolean DEFAULT false NOT NULL,
    "organicPercent" integer,
    "recycledPercent" integer,
    "plasticFreePackaging" boolean DEFAULT false NOT NULL,
    "recyclablePackaging" boolean DEFAULT false NOT NULL,
    "compostablePackaging" boolean DEFAULT false NOT NULL,
    "minimalPackaging" boolean DEFAULT false NOT NULL,
    "carbonNeutralShipping" boolean DEFAULT false NOT NULL,
    "madeLocally" boolean DEFAULT false NOT NULL,
    "madeToOrder" boolean DEFAULT false NOT NULL,
    "renewableEnergyMade" boolean DEFAULT false NOT NULL,
    "carbonFootprintKg" double precision,
    "madeIn" text,
    "isRecyclable" boolean DEFAULT false NOT NULL,
    "isCompostable" boolean DEFAULT false NOT NULL,
    "isRepairable" boolean DEFAULT false NOT NULL,
    "hasDisposalInfo" boolean DEFAULT false NOT NULL,
    "disposalInstructions" text,
    "completenessPercent" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductEcoProfile" OWNER TO bentyson;

--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."ProductImage" (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    "altText" text,
    "position" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductImage" OWNER TO bentyson;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    sku text,
    price double precision,
    "inventoryQuantity" integer DEFAULT 0 NOT NULL,
    "trackInventory" boolean DEFAULT true NOT NULL,
    "imageId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO bentyson;

--
-- Name: Promotion; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Promotion" (
    id text NOT NULL,
    "shopId" text,
    code text NOT NULL,
    description text NOT NULL,
    "discountType" text NOT NULL,
    "discountValue" double precision NOT NULL,
    "minimumPurchase" double precision,
    "maxUses" integer,
    "currentUses" integer DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Promotion" OWNER TO bentyson;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    rating integer NOT NULL,
    text text,
    images text[],
    "isVerifiedPurchase" boolean DEFAULT false NOT NULL,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO bentyson;

--
-- Name: SearchHistory; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."SearchHistory" (
    id text NOT NULL,
    "userId" text,
    query text NOT NULL,
    filters jsonb,
    results integer NOT NULL,
    clicked text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SearchHistory" OWNER TO bentyson;

--
-- Name: SellerApplication; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."SellerApplication" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "businessName" text NOT NULL,
    "businessWebsite" text,
    "businessDescription" text NOT NULL,
    "ecoQuestions" jsonb NOT NULL,
    "preferredNonprofit" text,
    "donationPercentage" double precision DEFAULT 1.0 NOT NULL,
    status public."ApplicationStatus" DEFAULT 'PENDING'::public."ApplicationStatus" NOT NULL,
    "reviewNotes" text,
    "reviewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "autoApprovalEligible" boolean DEFAULT false NOT NULL,
    "completenessScore" integer DEFAULT 0 NOT NULL,
    "rejectionReason" text,
    "shopEcoProfileData" jsonb,
    tier text DEFAULT 'starter'::text NOT NULL
);


ALTER TABLE public."SellerApplication" OWNER TO bentyson;

--
-- Name: SellerReview; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."SellerReview" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    rating integer NOT NULL,
    "shippingSpeedRating" integer,
    "communicationRating" integer,
    "itemAsDescribedRating" integer,
    text text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SellerReview" OWNER TO bentyson;

--
-- Name: ShippingProfile; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."ShippingProfile" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    name text NOT NULL,
    "processingTimeMin" integer NOT NULL,
    "processingTimeMax" integer NOT NULL,
    "shippingOrigin" jsonb NOT NULL,
    "shippingRates" jsonb NOT NULL,
    "carbonNeutralPrice" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShippingProfile" OWNER TO bentyson;

--
-- Name: Shop; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."Shop" (
    id text NOT NULL,
    "userId" text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    bio text,
    story text,
    "bannerImage" text,
    logo text,
    colors jsonb,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verificationStatus" public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    "stripeAccountId" text,
    "nonprofitId" text,
    "donationPercentage" double precision DEFAULT 1.0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Shop" OWNER TO bentyson;

--
-- Name: ShopEcoProfile; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."ShopEcoProfile" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "plasticFreePackaging" boolean DEFAULT false NOT NULL,
    "recycledPackaging" boolean DEFAULT false NOT NULL,
    "biodegradablePackaging" boolean DEFAULT false NOT NULL,
    "organicMaterials" boolean DEFAULT false NOT NULL,
    "recycledMaterials" boolean DEFAULT false NOT NULL,
    "fairTradeSourcing" boolean DEFAULT false NOT NULL,
    "localSourcing" boolean DEFAULT false NOT NULL,
    "carbonNeutralShipping" boolean DEFAULT false NOT NULL,
    "renewableEnergy" boolean DEFAULT false NOT NULL,
    "carbonOffset" boolean DEFAULT false NOT NULL,
    "annualCarbonEmissions" double precision,
    "carbonOffsetPercent" integer,
    "renewableEnergyPercent" integer,
    "waterConservation" boolean DEFAULT false NOT NULL,
    "fairWageCertified" boolean DEFAULT false NOT NULL,
    "takeBackProgram" boolean DEFAULT false NOT NULL,
    "repairService" boolean DEFAULT false NOT NULL,
    "completenessPercent" integer DEFAULT 0 NOT NULL,
    tier text DEFAULT 'starter'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShopEcoProfile" OWNER TO bentyson;

--
-- Name: ShopSection; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."ShopSection" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "position" integer DEFAULT 0 NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShopSection" OWNER TO bentyson;

--
-- Name: ShopSectionProduct; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."ShopSectionProduct" (
    id text NOT NULL,
    "sectionId" text NOT NULL,
    "productId" text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ShopSectionProduct" OWNER TO bentyson;

--
-- Name: SupportTicket; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."SupportTicket" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    subject text NOT NULL,
    message text NOT NULL,
    status public."SupportTicketStatus" DEFAULT 'OPEN'::public."SupportTicketStatus" NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SupportTicket" OWNER TO bentyson;

--
-- Name: SustainabilityScore; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."SustainabilityScore" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "totalScore" integer NOT NULL,
    "materialsScore" integer NOT NULL,
    "packagingScore" integer NOT NULL,
    "carbonScore" integer NOT NULL,
    "certificationScore" integer NOT NULL,
    "breakdownJson" jsonb NOT NULL,
    "calculatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SustainabilityScore" OWNER TO bentyson;

--
-- Name: User; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    name text,
    avatar text,
    phone text,
    role public."Role" DEFAULT 'BUYER'::public."Role" NOT NULL,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO bentyson;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: bentyson
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO bentyson;

--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Address" (id, "userId", type, "firstName", "lastName", company, address1, address2, city, state, "postalCode", country, phone, "isDefault", "createdAt", "updatedAt") FROM stdin;
cmgnxbnn1004dluj8o0wh5iuf	cmgnxbnn1004cluj8ux23g3az	shipping	Sarah	Green	\N	123 Eco Street	\N	Portland	OR	97201	US	\N	t	2025-10-12 16:33:40.718	2025-10-12 16:33:40.718
\.


--
-- Data for Name: AnalyticsEvent; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."AnalyticsEvent" (id, "userId", "shopId", "eventType", "eventData", "sessionId", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Category" (id, "parentId", name, slug, description, image, "metaTitle", "metaDescription", "position", "createdAt", "updatedAt") FROM stdin;
cmgnxbnlp0000luj8b4t4btb4	\N	Home & Living	home-living	Sustainable home goods, decor, and living essentials	\N	\N	\N	0	2025-10-12 16:33:40.669	2025-10-12 16:33:40.669
cmgnxbnlq0002luj8re277f5w	cmgnxbnlp0000luj8b4t4btb4	Decor & Accents	decor-accents	Wall art, sculptures, decorative objects	\N	\N	\N	0	2025-10-12 16:33:40.671	2025-10-12 16:33:40.671
cmgnxbnlz000pluj8ubcw2ft4	cmgnxbnly000dluj8v52ohypo	Food Storage & Containers	food-storage-containers	Jars, tins, reusable bags, beeswax wraps	\N	\N	\N	4	2025-10-12 16:33:40.68	2025-10-12 16:33:40.68
cmgnxbnm0000qluj8z4fnbtnw	\N	Personal Care & Beauty	personal-care-beauty	Natural and organic personal care products	\N	\N	\N	2	2025-10-12 16:33:40.68	2025-10-12 16:33:40.68
cmgnxbnm0000tluj8f1j4d9k8	cmgnxbnm0000qluj8z4fnbtnw	Skincare	skincare	Cleansers, moisturizers, serums, masks	\N	\N	\N	0	2025-10-12 16:33:40.681	2025-10-12 16:33:40.681
cmgnxbnm2001fluj87uxjpglv	cmgnxbnm10013luj8vw7szebo	Hats & Caps	hats-caps	Beanies, sun hats, baseball caps	\N	\N	\N	5	2025-10-12 16:33:40.682	2025-10-12 16:33:40.682
cmgnxbnm3001kluj8of1a4q24	cmgnxbnm3001gluj845ednqc9	Toys & Games	toys-games	Wooden toys, puzzles, educational games	\N	\N	\N	1	2025-10-12 16:33:40.684	2025-10-12 16:33:40.684
cmgnxbnm50020luj8b82z0clx	cmgnxbnm4001rluj866wgoevg	Condiments & Sauces	condiments-sauces	Hot sauce, jams, honey, spreads	\N	\N	\N	3	2025-10-12 16:33:40.685	2025-10-12 16:33:40.685
cmgnxbnm60027luj8vjp3qhfc	cmgnxbnm50022luj8olpoinjg	Soaps & Cleansers	soaps-cleansers	Bar soap, liquid soap, body wash	\N	\N	\N	1	2025-10-12 16:33:40.686	2025-10-12 16:33:40.686
cmgnxbnmi002jluj8t0ekgdu1	cmgnxbnmh002dluj8fzul3xvk	Fitness & Exercise	fitness-exercise	Resistance bands, weights, workout accessories	\N	\N	\N	2	2025-10-12 16:33:40.699	2025-10-12 16:33:40.699
cmgnxbnmj002uluj8wt8wylgu	cmgnxbnmj002oluj8k4tpn0ay	Seeds & Plants	seeds-plants	Heirloom seeds, seedlings, bulbs	\N	\N	\N	2	2025-10-12 16:33:40.7	2025-10-12 16:33:40.7
cmgnxbnmk002zluj8mv97rg0w	\N	Office & Stationery	office-stationery	Eco-friendly office and paper goods	\N	\N	\N	9	2025-10-12 16:33:40.701	2025-10-12 16:33:40.701
cmgnxbnmn0034luj89didms7u	cmgnxbnmk002zluj8mv97rg0w	Notebooks & Journals	notebooks-journals	Recycled paper notebooks, planners, journals	\N	\N	\N	0	2025-10-12 16:33:40.703	2025-10-12 16:33:40.703
cmgnxbnmo003kluj8kf1jpjxu	cmgnxbnmn003aluj83qmb73bu	Pet Treats & Food	pet-treats-food	Organic treats, natural pet food	\N	\N	\N	4	2025-10-12 16:33:40.704	2025-10-12 16:33:40.704
cmgnxbnmp003rluj8nuap15jc	cmgnxbnmo003lluj8ehw3y7zf	Natural Dyes	natural-dyes	Plant-based dyes, fabric dye kits	\N	\N	\N	2	2025-10-12 16:33:40.705	2025-10-12 16:33:40.705
cmgnxbnmq0043luj8q99r3sa7	cmgnxbnmp003wluj8tvjy2tco	Handmade Ceramics	handmade-ceramics	Pottery, ceramic art, vases	\N	\N	\N	2	2025-10-12 16:33:40.706	2025-10-12 16:33:40.706
cmgnxbnlu0006luj8e9xaivuk	cmgnxbnlp0000luj8b4t4btb4	Lighting	lighting	Lamps, candles, light fixtures	\N	\N	\N	1	2025-10-12 16:33:40.671	2025-10-12 16:33:40.671
cmgnxbnlz000oluj86ilq25a6	cmgnxbnly000dluj8v52ohypo	Utensils & Gadgets	utensils-gadgets	Cutlery, wooden spoons, kitchen tools	\N	\N	\N	5	2025-10-12 16:33:40.68	2025-10-12 16:33:40.68
cmgnxbnm1000zluj8a3jb8lp8	cmgnxbnm0000qluj8z4fnbtnw	Bath & Shower	bath-shower	Body wash, soap bars, bath accessories	\N	\N	\N	2	2025-10-12 16:33:40.681	2025-10-12 16:33:40.681
cmgnxbnm2001aluj8by1ideg7	cmgnxbnm10013luj8vw7szebo	Bags & Purses	bags-purses	Tote bags, backpacks, handbags, clutches	\N	\N	\N	2	2025-10-12 16:33:40.682	2025-10-12 16:33:40.682
cmgnxbnm3001pluj8yisv4c8l	cmgnxbnm3001gluj845ednqc9	Baby Care Products	baby-care-products	Diaper cream, baby lotion, wipes	\N	\N	\N	3	2025-10-12 16:33:40.684	2025-10-12 16:33:40.684
cmgnxbnm5001xluj833qjokim	cmgnxbnm4001rluj866wgoevg	Snacks & Treats	snacks-treats	Organic snacks, chocolates, granola bars	\N	\N	\N	1	2025-10-12 16:33:40.685	2025-10-12 16:33:40.685
cmgnxbnm60028luj8vws02858	cmgnxbnm50022luj8olpoinjg	Body Scrubs & Exfoliants	body-scrubs-exfoliants	Sugar scrubs, salt scrubs, dry brushes	\N	\N	\N	2	2025-10-12 16:33:40.686	2025-10-12 16:33:40.686
cmgnxbnmi002iluj8fxo77qe7	cmgnxbnmh002dluj8fzul3xvk	Yoga & Meditation	yoga-meditation	Yoga mats, meditation cushions, props	\N	\N	\N	1	2025-10-12 16:33:40.699	2025-10-12 16:33:40.699
cmgnxbnmj002xluj8yu88tne3	cmgnxbnmj002oluj8k4tpn0ay	Outdoor Decor	outdoor-decor	Garden statues, wind chimes, outdoor lighting	\N	\N	\N	3	2025-10-12 16:33:40.7	2025-10-12 16:33:40.7
cmgnxbnmn0038luj8wv2fflj4	cmgnxbnmk002zluj8mv97rg0w	Greeting Cards	greeting-cards	Handmade cards, plantable cards, stationery sets	\N	\N	\N	3	2025-10-12 16:33:40.703	2025-10-12 16:33:40.703
cmgnxbnmo003iluj8jwaami6h	cmgnxbnmn003aluj83qmb73bu	Pet Grooming	pet-grooming	Natural shampoos, brushes, grooming tools	\N	\N	\N	2	2025-10-12 16:33:40.704	2025-10-12 16:33:40.704
cmgnxbnmp003uluj8yqk79tuw	cmgnxbnmo003lluj8ehw3y7zf	Crafting Tools	crafting-tools	Scissors, needles, knitting needles, hooks	\N	\N	\N	3	2025-10-12 16:33:40.705	2025-10-12 16:33:40.705
cmgnxbnmp003wluj8tvjy2tco	\N	Art & Collectibles	art-collectibles	Original art and handmade collectibles	\N	\N	\N	12	2025-10-12 16:33:40.706	2025-10-12 16:33:40.706
cmgnxbnmq0040luj82ti0133f	cmgnxbnmp003wluj8tvjy2tco	Wall Art & Prints	wall-art-prints	Paintings, prints, posters, framed art	\N	\N	\N	0	2025-10-12 16:33:40.706	2025-10-12 16:33:40.706
cmgnxbnlu0004luj8ttnqxz9j	cmgnxbnlp0000luj8b4t4btb4	Storage & Organization	storage-organization	Baskets, bins, shelving, organizers	\N	\N	\N	3	2025-10-12 16:33:40.671	2025-10-12 16:33:40.671
cmgnxbnlz000jluj80yqxt3i3	cmgnxbnly000dluj8v52ohypo	Drinkware & Glassware	drinkware-glassware	Cups, mugs, glasses, water bottles	\N	\N	\N	2	2025-10-12 16:33:40.68	2025-10-12 16:33:40.68
cmgnxbnm1000yluj80dsypnzj	cmgnxbnm0000qluj8z4fnbtnw	Oral Care	oral-care	Toothpaste, toothbrushes, mouthwash, floss	\N	\N	\N	3	2025-10-12 16:33:40.681	2025-10-12 16:33:40.681
cmgnxbnm2001eluj8wwsd8eks	cmgnxbnm10013luj8vw7szebo	Scarves & Wraps	scarves-wraps	Scarves, shawls, bandanas	\N	\N	\N	4	2025-10-12 16:33:40.682	2025-10-12 16:33:40.682
cmgnxbnm3001gluj845ednqc9	\N	Baby & Kids	baby-kids	Safe, natural products for children	\N	\N	\N	4	2025-10-12 16:33:40.683	2025-10-12 16:33:40.683
cmgnxbnm3001jluj826026ef5	cmgnxbnm3001gluj845ednqc9	Baby Clothing	baby-clothing	Onesies, sleepers, organic baby clothes	\N	\N	\N	0	2025-10-12 16:33:40.684	2025-10-12 16:33:40.684
cmgnxbnm50021luj8ohfj5lpg	cmgnxbnm4001rluj866wgoevg	Baking Ingredients	baking-ingredients	Organic flours, sugars, extracts, mixes	\N	\N	\N	4	2025-10-12 16:33:40.685	2025-10-12 16:33:40.685
cmgnxbnm50022luj8olpoinjg	\N	Bath & Body	bath-body	Natural bath and body care essentials	\N	\N	\N	6	2025-10-12 16:33:40.686	2025-10-12 16:33:40.686
cmgnxbnm60026luj8n0dcp3k8	cmgnxbnm50022luj8olpoinjg	Bath Salts & Soaks	bath-salts-soaks	Mineral bath salts, bath bombs, soaking salts	\N	\N	\N	0	2025-10-12 16:33:40.686	2025-10-12 16:33:40.686
cmgnxbnmi002nluj8d2jzceoi	cmgnxbnmh002dluj8fzul3xvk	Sleep & Relaxation	sleep-relaxation	Eye masks, lavender sachets, sleep aids	\N	\N	\N	4	2025-10-12 16:33:40.699	2025-10-12 16:33:40.699
cmgnxbnmj002oluj8k4tpn0ay	\N	Outdoor & Garden	outdoor-garden	Sustainable gardening and outdoor living	\N	\N	\N	8	2025-10-12 16:33:40.699	2025-10-12 16:33:40.699
cmgnxbnmj002sluj8oghashyg	cmgnxbnmj002oluj8k4tpn0ay	Planters & Pots	planters-pots	Ceramic pots, hanging planters, plant stands	\N	\N	\N	0	2025-10-12 16:33:40.7	2025-10-12 16:33:40.7
cmgnxbnmn0039luj8tzke3zfa	cmgnxbnmk002zluj8mv97rg0w	Gift Wrap & Packaging	gift-wrap-packaging	Recycled wrapping paper, reusable bags, ribbons	\N	\N	\N	4	2025-10-12 16:33:40.703	2025-10-12 16:33:40.703
cmgnxbnmn003aluj83qmb73bu	\N	Pet Supplies	pet-supplies	Eco-friendly products for pets	\N	\N	\N	10	2025-10-12 16:33:40.704	2025-10-12 16:33:40.704
cmgnxbnmo003eluj8ytbpkmwk	cmgnxbnmn003aluj83qmb73bu	Pet Toys	pet-toys	Natural rubber toys, rope toys, interactive toys	\N	\N	\N	0	2025-10-12 16:33:40.704	2025-10-12 16:33:40.704
cmgnxbnmp003pluj8qfnw89xe	cmgnxbnmo003lluj8ehw3y7zf	Yarns & Threads	yarns-threads	Natural fiber yarns, embroidery thread	\N	\N	\N	1	2025-10-12 16:33:40.705	2025-10-12 16:33:40.705
cmgnxbnmq0046luj8rik3vf1r	cmgnxbnmp003wluj8tvjy2tco	Mixed Media	mixed-media	Collage, assemblage, mixed media art	\N	\N	\N	4	2025-10-12 16:33:40.706	2025-10-12 16:33:40.706
cmgnxbnlv0008luj8s8qicvai	cmgnxbnlp0000luj8b4t4btb4	Candles & Home Fragrance	candles-fragrance	Scented candles, diffusers, incense	\N	\N	\N	4	2025-10-12 16:33:40.671	2025-10-12 16:33:40.671
cmgnxbnlz000nluj82d6d77l4	cmgnxbnly000dluj8v52ohypo	Kitchen Linens	kitchen-linens	Dish towels, aprons, napkins, tablecloths	\N	\N	\N	3	2025-10-12 16:33:40.68	2025-10-12 16:33:40.68
cmgnxbnm1000vluj81w37daqe	cmgnxbnm0000qluj8z4fnbtnw	Haircare	haircare	Shampoo, conditioner, hair treatments	\N	\N	\N	1	2025-10-12 16:33:40.681	2025-10-12 16:33:40.681
cmgnxbnm2001dluj8a4x6e1sp	cmgnxbnm10013luj8vw7szebo	Jewelry	jewelry	Necklaces, earrings, bracelets, rings	\N	\N	\N	3	2025-10-12 16:33:40.682	2025-10-12 16:33:40.682
cmgnxbnm3001qluj84g9x7tfs	cmgnxbnm3001gluj845ednqc9	Kids' Clothing	kids-clothing	Sustainable clothing for toddlers and children	\N	\N	\N	4	2025-10-12 16:33:40.684	2025-10-12 16:33:40.684
cmgnxbnm4001rluj866wgoevg	\N	Food & Beverages	food-beverages	Organic and fair-trade food products	\N	\N	\N	5	2025-10-12 16:33:40.685	2025-10-12 16:33:40.685
cmgnxbnm5001vluj8kpbklddl	cmgnxbnm4001rluj866wgoevg	Coffee & Tea	coffee-tea	Organic coffee beans, loose leaf tea, herbal blends	\N	\N	\N	0	2025-10-12 16:33:40.685	2025-10-12 16:33:40.685
cmgnxbnm6002bluj8av7ey2z3	cmgnxbnm50022luj8olpoinjg	Lotions & Moisturizers	lotions-moisturizers	Body butter, hand cream, body lotion	\N	\N	\N	3	2025-10-12 16:33:40.686	2025-10-12 16:33:40.686
cmgnxbnmi002mluj8zia9w8g1	cmgnxbnmh002dluj8fzul3xvk	Supplements & Vitamins	supplements-vitamins	Natural supplements, herbal remedies, vitamins	\N	\N	\N	3	2025-10-12 16:33:40.699	2025-10-12 16:33:40.699
cmgnxbnmj002tluj8fi8k4x2m	cmgnxbnmj002oluj8k4tpn0ay	Gardening Tools	gardening-tools	Hand tools, gloves, watering cans	\N	\N	\N	1	2025-10-12 16:33:40.7	2025-10-12 16:33:40.7
cmgnxbnmn0037luj8kf5fzvdm	cmgnxbnmk002zluj8mv97rg0w	Desk Organization	desk-organization	Desk organizers, file holders, storage	\N	\N	\N	2	2025-10-12 16:33:40.703	2025-10-12 16:33:40.703
cmgnxbnmo003fluj82mhmy3gi	cmgnxbnmn003aluj83qmb73bu	Pet Accessories	pet-accessories	Collars, leashes, bowls, carriers	\N	\N	\N	1	2025-10-12 16:33:40.704	2025-10-12 16:33:40.704
cmgnxbnmp003vluj86shq286y	cmgnxbnmo003lluj8ehw3y7zf	Kits & Projects	kits-projects	DIY craft kits, project bundles	\N	\N	\N	4	2025-10-12 16:33:40.705	2025-10-12 16:33:40.705
cmgnxbnmq0041luj8ox6enqom	cmgnxbnmp003wluj8tvjy2tco	Sculptures & Figurines	sculptures-figurines	Wood carvings, clay sculptures, statues	\N	\N	\N	1	2025-10-12 16:33:40.706	2025-10-12 16:33:40.706
cmgnxbnlw000aluj8dbkoi71j	cmgnxbnlp0000luj8b4t4btb4	Rugs & Flooring	rugs-flooring	Area rugs, floor mats, runners	\N	\N	\N	5	2025-10-12 16:33:40.671	2025-10-12 16:33:40.671
cmgnxbnlz000iluj8d1l0fr6o	cmgnxbnly000dluj8v52ohypo	Dinnerware	dinnerware	Plates, bowls, serving dishes	\N	\N	\N	1	2025-10-12 16:33:40.68	2025-10-12 16:33:40.68
cmgnxbnm10011luj8nklrxvj1	cmgnxbnm0000qluj8z4fnbtnw	Makeup & Cosmetics	makeup-cosmetics	Natural makeup, lip balm, nail care	\N	\N	\N	4	2025-10-12 16:33:40.681	2025-10-12 16:33:40.681
cmgnxbnm20018luj8pbeq2e6w	cmgnxbnm10013luj8vw7szebo	Men's Clothing	mens-clothing	Shirts, pants, jackets, sweaters	\N	\N	\N	1	2025-10-12 16:33:40.682	2025-10-12 16:33:40.682
cmgnxbnm3001nluj8v536kg0x	cmgnxbnm3001gluj845ednqc9	Nursery Decor	nursery-decor	Wall art, mobiles, room accessories	\N	\N	\N	2	2025-10-12 16:33:40.684	2025-10-12 16:33:40.684
cmgnxbnm5001wluj8f898ztp0	cmgnxbnm4001rluj866wgoevg	Pantry Staples	pantry-staples	Grains, flours, oils, spices	\N	\N	\N	2	2025-10-12 16:33:40.685	2025-10-12 16:33:40.685
cmgnxbnm6002cluj86z3y6vlc	cmgnxbnm50022luj8olpoinjg	Essential Oils	essential-oils	Pure essential oils, aromatherapy blends	\N	\N	\N	4	2025-10-12 16:33:40.686	2025-10-12 16:33:40.686
cmgnxbnmh002dluj8fzul3xvk	\N	Wellness & Self-Care	wellness-self-care	Holistic wellness and self-care products	\N	\N	\N	7	2025-10-12 16:33:40.698	2025-10-12 16:33:40.698
cmgnxbnmi002hluj84oysi56f	cmgnxbnmh002dluj8fzul3xvk	Aromatherapy	aromatherapy	Diffusers, essential oil blends, room sprays	\N	\N	\N	0	2025-10-12 16:33:40.699	2025-10-12 16:33:40.699
cmgnxbnmj002yluj8q7o6nd4h	cmgnxbnmj002oluj8k4tpn0ay	Composting Supplies	composting-supplies	Compost bins, worm farms, compost accessories	\N	\N	\N	4	2025-10-12 16:33:40.7	2025-10-12 16:33:40.7
cmgnxbnmn0033luj83ay1nkmi	cmgnxbnmk002zluj8mv97rg0w	Pens & Pencils	pens-pencils	Recycled pens, wooden pencils, refillable pens	\N	\N	\N	1	2025-10-12 16:33:40.703	2025-10-12 16:33:40.703
cmgnxbnmo003jluj840klfelr	cmgnxbnmn003aluj83qmb73bu	Pet Bedding	pet-bedding	Organic pet beds, blankets, mats	\N	\N	\N	3	2025-10-12 16:33:40.704	2025-10-12 16:33:40.704
cmgnxbnmo003lluj8ehw3y7zf	\N	Craft Supplies	craft-supplies	Sustainable crafting materials	\N	\N	\N	11	2025-10-12 16:33:40.705	2025-10-12 16:33:40.705
cmgnxbnmp003oluj8bx4fvvb3	cmgnxbnmo003lluj8ehw3y7zf	Fabrics & Textiles	fabrics-textiles	Organic cotton, linen, wool fabrics	\N	\N	\N	0	2025-10-12 16:33:40.705	2025-10-12 16:33:40.705
cmgnxbnmq0045luj8a56e4uel	cmgnxbnmp003wluj8tvjy2tco	Photography	photography	Fine art photography, nature prints	\N	\N	\N	3	2025-10-12 16:33:40.706	2025-10-12 16:33:40.706
cmgnxbnlw000cluj8lof8hdra	cmgnxbnlp0000luj8b4t4btb4	Bedding & Linens	bedding-linens	Sheets, pillowcases, duvet covers, blankets	\N	\N	\N	2	2025-10-12 16:33:40.671	2025-10-12 16:33:40.671
cmgnxbnly000dluj8v52ohypo	\N	Kitchen & Dining	kitchen-dining	Eco-friendly kitchenware and dining essentials	\N	\N	\N	1	2025-10-12 16:33:40.679	2025-10-12 16:33:40.679
cmgnxbnlz000hluj8niffwsxm	cmgnxbnly000dluj8v52ohypo	Cookware & Bakeware	cookware-bakeware	Pots, pans, baking dishes, dutch ovens	\N	\N	\N	0	2025-10-12 16:33:40.68	2025-10-12 16:33:40.68
cmgnxbnm10012luj8fzznl22o	cmgnxbnm0000qluj8z4fnbtnw	Men's Grooming	mens-grooming	Beard care, shaving, cologne	\N	\N	\N	5	2025-10-12 16:33:40.681	2025-10-12 16:33:40.681
cmgnxbnm10013luj8vw7szebo	\N	Fashion & Accessories	fashion-accessories	Sustainable clothing and accessories	\N	\N	\N	3	2025-10-12 16:33:40.682	2025-10-12 16:33:40.682
cmgnxbnm20017luj8gixqc6id	cmgnxbnm10013luj8vw7szebo	Women's Clothing	womens-clothing	Tops, dresses, bottoms, outerwear	\N	\N	\N	0	2025-10-12 16:33:40.682	2025-10-12 16:33:40.682
\.


--
-- Data for Name: Certification; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Certification" (id, "productId", "shopId", name, type, "issuedBy", "issuedDate", "expiryDate", certificate, verified, "createdAt", "verifiedAt", "verifiedBy") FROM stdin;
cmgnxbnnf004uluj8orsl9e7g	\N	\N	Carbon Neutral	product	Evercraft Verification Team	\N	\N	\N	t	2025-10-12 16:33:40.731	\N	\N
cmgnxbnnf004vluj8x1vulxu0	cmgnxbnnq0059luj876btzjym	\N	Fair Trade Certified	product	Fair Trade International	\N	\N	\N	t	2025-10-12 16:33:40.732	\N	\N
cmgnxbnng004xluj8jufu7qnp	cmgnxbnns005eluj8tx9reqfd	\N	Zero Waste	product	Evercraft Verification Team	\N	\N	\N	t	2025-10-12 16:33:40.732	\N	\N
cmgnxbnne004tluj8dm86mc4e	cmgnxbnns005eluj8tx9reqfd	\N	Plastic Free	product	Evercraft Verification Team	\N	\N	\N	t	2025-10-12 16:33:40.73	\N	\N
cmgnxbnnf004wluj86urhm6th	cmgnxbnns005eluj8tx9reqfd	\N	USDA Organic	product	US Department of Agriculture	\N	\N	\N	t	2025-10-12 16:33:40.732	\N	\N
\.


--
-- Data for Name: Collection; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Collection" (id, "userId", name, description, "isPublic", "createdAt", "updatedAt") FROM stdin;
cmgnxbnny005rluj84n7sdjjl	cmgnxbnn1004cluj8ux23g3az	My Wishlist	\N	f	2025-10-12 16:33:40.75	2025-10-12 16:33:40.75
\.


--
-- Data for Name: CollectionProduct; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."CollectionProduct" (id, "collectionId", "productId", "createdAt") FROM stdin;
cmgnxbnny005tluj8z7v8h11b	cmgnxbnny005rluj84n7sdjjl	cmgnxbnnh004zluj8ce3kp2um	2025-10-12 16:33:40.75
cmgnxbnny005uluj8wl8ixkwr	cmgnxbnny005rluj84n7sdjjl	cmgnxbnns005eluj8tx9reqfd	2025-10-12 16:33:40.75
\.


--
-- Data for Name: Donation; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Donation" (id, "orderId", "nonprofitId", "shopId", amount, status, "payoutId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Favorite; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Favorite" (id, "userId", "productId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Message" (id, "fromUserId", "toUserId", "orderId", subject, body, attachments, "isRead", "createdAt") FROM stdin;
\.


--
-- Data for Name: Nonprofit; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Nonprofit" (id, name, ein, mission, description, category, logo, images, website, "socialLinks", "isVerified", "stripeAccountId", "createdAt", "updatedAt") FROM stdin;
cmgnxbnmu0047luj8lwso2fa7	Ocean Conservancy	23-7245152	Ocean Conservancy works to protect the ocean from today's greatest global challenges.	\N	\N	https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200	\N	https://oceanconservancy.org	\N	t	\N	2025-10-12 16:33:40.711	2025-10-12 16:33:40.711
cmgnxbnmy004aluj826zduco5	Rainforest Alliance	13-3377893	Creating a more sustainable world by using social and market forces.	\N	\N	https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200	\N	https://www.rainforest-alliance.org	\N	t	\N	2025-10-12 16:33:40.711	2025-10-12 16:33:40.711
cmgnxbnmy0049luj8d637pp74	Fair Trade Federation	52-2106638	Strengthening and promoting organizations fully committed to Fair Trade.	\N	\N	https://images.unsplash.com/photo-1542838132-92c53300491e?w=200	\N	https://www.fairtradefederation.org	\N	t	\N	2025-10-12 16:33:40.711	2025-10-12 16:33:40.711
cmgnxbnmy0048luj8nmlq790l	The Nature Conservancy	53-0242652	Conserving the lands and waters on which all life depends.	\N	\N	https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200	\N	https://www.nature.org	\N	t	\N	2025-10-12 16:33:40.711	2025-10-12 16:33:40.711
\.


--
-- Data for Name: NotificationPreference; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."NotificationPreference" (id, "userId", "emailMarketing", "emailOrderUpdates", "emailMessages", "emailReviews", "pushNotifications", "smsNotifications", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Order" (id, "orderNumber", "buyerId", status, subtotal, "shippingCost", tax, total, "nonprofitDonation", "shippingAddress", "billingAddress", "paymentStatus", "paymentIntentId", "createdAt", "updatedAt", "shippingLabelUrl", "shippoTransactionId", "trackingCarrier", "trackingNumber") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."OrderItem" (id, "orderId", "productId", "variantId", "shopId", quantity, "priceAtPurchase", subtotal, "nonprofitId", "donationAmount", "createdAt") FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Payment" (id, "orderId", "stripePaymentIntentId", amount, "platformFee", "sellerPayout", "nonprofitDonation", status, "createdAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Product" (id, "shopId", title, description, price, "compareAtPrice", sku, "categoryId", tags, status, "ecoScore", "ecoAttributes", "metaTitle", "metaDescription", "createdAt", "updatedAt", "inventoryQuantity", "lowStockThreshold", "trackInventory", "hasVariants", "variantOptions") FROM stdin;
cmgnxbnnh004zluj8ce3kp2um	cmgnxbnn5004iluj8b8v36xhs	Organic Cotton Tote Bag - Reusable Shopping Bag	Durable, reusable tote bag made from 100% organic cotton. Perfect for grocery shopping, beach trips, or everyday use. Holds up to 30 lbs.	24.99	34.99	\N	cmgnxbnm2001aluj8by1ideg7	\N	ACTIVE	\N	{"lifespan": "5+ years with proper care", "material": "100% Organic Cotton", "packaging": "Compostable", "carbonFootprint": "Offset through tree planting"}	\N	\N	2025-10-12 16:33:40.733	2025-10-12 16:33:40.733	50	\N	t	f	\N
cmgnxbnnn0054luj8h0y3nw61	cmgnxbnnb004mluj8wzoat9ov	Bamboo Cutlery Set - Zero Waste Travel Utensils	Complete bamboo cutlery set with fork, knife, spoon, and chopsticks. Comes in a compact carrying case. Perfect for on-the-go meals.	18.5	\N	\N	cmgnxbnlz000iluj8d1l0fr6o	\N	ACTIVE	\N	{"lifespan": "3+ years", "material": "Sustainably harvested bamboo", "packaging": "Recycled cardboard", "carbonFootprint": "Low impact production"}	\N	\N	2025-10-12 16:33:40.739	2025-10-12 16:33:40.739	100	\N	t	f	\N
cmgnxbnnq0059luj876btzjym	cmgnxbnnc004qluj8hn13zqm2	Fair Trade Organic Coffee Beans - 12oz Dark Roast	Rich, bold dark roast coffee beans from Fair Trade certified farms. Notes of chocolate and caramel. Roasted fresh to order.	15.99	\N	\N	cmgnxbnm5001vluj8kpbklddl	\N	ACTIVE	\N	{"origin": "Small farms in Colombia", "material": "Organic coffee beans", "packaging": "Recyclable aluminum bag", "carbonFootprint": "Carbon neutral shipping"}	\N	\N	2025-10-12 16:33:40.742	2025-10-12 16:33:40.742	200	\N	t	f	\N
cmgnxbnns005eluj8tx9reqfd	cmgnxbnn5004iluj8b8v36xhs	Reusable Beeswax Food Wraps - Set of 3	Natural alternative to plastic wrap. Made with organic cotton, beeswax, jojoba oil, and tree resin. Washable and reusable for up to a year.	22	\N	\N	cmgnxbnlz000iluj8d1l0fr6o	\N	ACTIVE	\N	{"lifespan": "1 year with regular use", "material": "Organic cotton, beeswax, jojoba oil", "packaging": "Compostable paper", "carbonFootprint": "Minimal"}	\N	\N	2025-10-12 16:33:40.745	2025-10-12 16:33:40.745	75	\N	t	f	\N
cmgpvxbif0003lu3w4o6zlzu9	cmgoe68z40003luqlos5i6dnr	Engraved Glass	predator	24.99	\N	sadf	cmgnxbnlz000jluj80yqxt3i3	{}	ACTIVE	\N	{}	\N	\N	2025-10-14 01:30:04.528	2025-10-14 01:30:04.528	0	\N	f	f	\N
cmgr0pox30007lu6pc00szl2s	cmgoe68z40003luqlos5i6dnr	Glass	sdfasd	0	\N		cmgnxbnlz000hluj8niffwsxm	{}	ACTIVE	\N	{}	\N	\N	2025-10-14 20:31:52.927	2025-10-14 20:31:52.927	0	\N	t	t	{"options": [{"name": "Size", "values": ["small", "large"], "isCustom": false, "position": 0}]}
\.


--
-- Data for Name: ProductEcoProfile; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."ProductEcoProfile" (id, "productId", "isOrganic", "isRecycled", "isBiodegradable", "isVegan", "isFairTrade", "organicPercent", "recycledPercent", "plasticFreePackaging", "recyclablePackaging", "compostablePackaging", "minimalPackaging", "carbonNeutralShipping", "madeLocally", "madeToOrder", "renewableEnergyMade", "carbonFootprintKg", "madeIn", "isRecyclable", "isCompostable", "isRepairable", "hasDisposalInfo", "disposalInstructions", "completenessPercent", "createdAt", "updatedAt") FROM stdin;
cmgnxbnnh0052luj83e34eshj	cmgnxbnnh004zluj8ce3kp2um	t	f	t	t	f	100	\N	t	t	t	t	f	t	t	f	\N	USA	f	t	t	t	Compost at end of life or recycle as textile	82	2025-10-12 16:33:40.733	2025-10-12 16:33:40.733
cmgnxbnnn0057luj8eiqvx18f	cmgnxbnnn0054luj8h0y3nw61	f	f	t	t	f	\N	\N	t	t	f	t	t	f	f	t	\N	China	t	t	f	t	Compost or recycle bamboo material. Carrying case is recyclable.	71	2025-10-12 16:33:40.739	2025-10-12 16:33:40.739
cmgnxbnnq005cluj8bsl5x9bj	cmgnxbnnq0059luj876btzjym	t	f	f	t	t	100	\N	t	t	f	f	t	f	t	t	\N	Colombia	t	f	f	t	Recycle aluminum bag. Coffee grounds can be composted.	59	2025-10-12 16:33:40.742	2025-10-12 16:33:40.742
cmgnxbnns005hluj8s6w6ko7h	cmgnxbnns005eluj8tx9reqfd	t	f	t	f	f	80	\N	t	t	t	t	t	t	f	t	\N	USA	f	t	f	t	Fully compostable at end of life. Cut into strips for faster composting.	94	2025-10-12 16:33:40.745	2025-10-12 16:33:40.745
cmgpvxbjc0008lu3wly65o7su	cmgpvxbif0003lu3w4o6zlzu9	t	f	f	f	f	\N	\N	f	f	f	f	f	f	f	f	\N	\N	f	f	f	f	\N	4	2025-10-14 01:30:04.584	2025-10-14 01:30:04.584
cmgr0poxn000dlu6pa4tyrjn8	cmgr0pox30007lu6pc00szl2s	f	f	f	f	t	\N	\N	f	f	f	f	f	f	f	f	\N	\N	f	f	f	f	\N	4	2025-10-14 20:31:52.955	2025-10-14 20:31:52.955
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."ProductImage" (id, "productId", url, "altText", "position", "isPrimary", "createdAt") FROM stdin;
cmgnxbnnh0050luj8yp7c9h2s	cmgnxbnnh004zluj8ce3kp2um	https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80	Organic cotton tote bag - front view	0	t	2025-10-12 16:33:40.733
cmgnxbnnn0055luj8zcbtitgg	cmgnxbnnn0054luj8h0y3nw61	https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80	Bamboo cutlery set with carrying case	0	t	2025-10-12 16:33:40.739
cmgnxbnnq005aluj8gj5kn849	cmgnxbnnq0059luj876btzjym	https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80	Fair trade organic coffee beans	0	t	2025-10-12 16:33:40.742
cmgnxbnns005fluj8p1ocnlbz	cmgnxbnns005eluj8tx9reqfd	https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80	Colorful beeswax food wraps	0	t	2025-10-12 16:33:40.745
cmgpvxbif0004lu3weak2v1rh	cmgpvxbif0003lu3w4o6zlzu9	https://utfs.io/f/QHLUk1rnzxEbxwyHrOWi23Zrl4tvmLniThUDcBwEkafIYeXO	Engraved Glass	0	t	2025-10-14 01:30:04.528
cmgpvxbif0005lu3wed8a1nkk	cmgpvxbif0003lu3w4o6zlzu9	https://utfs.io/f/QHLUk1rnzxEbfJa8qiebJgvNlMWPIdrGCFTkcwKOZnehBqXR	Engraved Glass	1	f	2025-10-14 01:30:04.528
cmgpvxbif0006lu3wayholu83	cmgpvxbif0003lu3w4o6zlzu9	https://utfs.io/f/QHLUk1rnzxEb8Pt6mtUBG70OkJpDeb5CnolX2IwKuASgZxRF	Engraved Glass	2	f	2025-10-14 01:30:04.528
cmgr0pox30008lu6pmo0rj9ql	cmgr0pox30007lu6pc00szl2s	https://utfs.io/f/QHLUk1rnzxEbNyddfHTVlEkXAyfiLFYRStKZ72zh9drNea8b	Glass	0	t	2025-10-14 20:31:52.927
cmgr0pox30009lu6p0b7493a8	cmgr0pox30007lu6pc00szl2s	https://utfs.io/f/QHLUk1rnzxEbQ7k0eWrnzxEb2U57irLeVoIP0uTQCWyO64Gk	Glass	1	f	2025-10-14 20:31:52.927
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."ProductVariant" (id, "productId", name, sku, price, "inventoryQuantity", "trackInventory", "imageId", "createdAt", "updatedAt") FROM stdin;
cmgr0poxj000alu6pwzpqo5g6	cmgr0pox30007lu6pc00szl2s	small	\N	26.99	10	t	cmgr0pox30008lu6pmo0rj9ql	2025-10-14 20:31:52.951	2025-10-14 20:31:52.951
cmgr0poxj000blu6py3qm8523	cmgr0pox30007lu6pc00szl2s	large	\N	30.99	8	t	cmgr0pox30009lu6p0b7493a8	2025-10-14 20:31:52.951	2025-10-14 20:31:52.951
\.


--
-- Data for Name: Promotion; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Promotion" (id, "shopId", code, description, "discountType", "discountValue", "minimumPurchase", "maxUses", "currentUses", "startDate", "endDate", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Review" (id, "productId", "userId", "orderId", rating, text, images, "isVerifiedPurchase", "helpfulCount", "createdAt", "updatedAt") FROM stdin;
cmgnxbnnu005jluj8xcebzeon	cmgnxbnnh004zluj8ce3kp2um	cmgnxbnn1004cluj8ux23g3az	\N	5	Love this tote! This tote bag is exactly what I was looking for. It's sturdy, beautiful, and I feel good using it instead of plastic bags.	\N	t	0	2025-10-12 16:33:40.747	2025-10-12 16:33:40.747
cmgnxbnnv005lluj8czmzwcdr	cmgnxbnnn0054luj8h0y3nw61	cmgnxbnn1004cluj8ux23g3az	\N	5	Perfect for travel. I take this everywhere now. No more plastic utensils! The bamboo is smooth and well-made.	\N	t	0	2025-10-12 16:33:40.748	2025-10-12 16:33:40.748
cmgnxbnnw005nluj8db1uius5	cmgnxbnnq0059luj876btzjym	cmgnxbnn1004cluj8ux23g3az	\N	4	Great coffee, great cause. Delicious dark roast with a smooth finish. Love that it supports fair trade farmers.	\N	t	0	2025-10-12 16:33:40.748	2025-10-12 16:33:40.748
\.


--
-- Data for Name: SearchHistory; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."SearchHistory" (id, "userId", query, filters, results, clicked, "createdAt") FROM stdin;
\.


--
-- Data for Name: SellerApplication; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."SellerApplication" (id, "userId", "businessName", "businessWebsite", "businessDescription", "ecoQuestions", "preferredNonprofit", "donationPercentage", status, "reviewNotes", "reviewedAt", "createdAt", "updatedAt", "autoApprovalEligible", "completenessScore", "rejectionReason", "shopEcoProfileData", tier) FROM stdin;
cmgoe2okz0001luqlck3wqgio	user_33zLMr7pIgUWEYzTyFJzUGlhwqx	Evercraft	http://www.lumengrave.com	We make stuff	{}	\N	1	APPROVED	\N	2025-10-13 00:25:21.878	2025-10-13 00:22:35.507	2025-10-13 00:25:21.878	f	49	\N	{"carbonOffset": false, "localSourcing": false, "repairService": false, "renewableEnergy": false, "takeBackProgram": true, "organicMaterials": true, "fairTradeSourcing": false, "fairWageCertified": false, "recycledMaterials": false, "recycledPackaging": true, "waterConservation": true, "carbonOffsetPercent": 30, "plasticFreePackaging": true, "annualCarbonEmissions": 13, "carbonNeutralShipping": false, "biodegradablePackaging": true, "renewableEnergyPercent": 25}	starter
\.


--
-- Data for Name: SellerReview; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."SellerReview" (id, "shopId", "userId", "orderId", rating, "shippingSpeedRating", "communicationRating", "itemAsDescribedRating", text, "createdAt", "updatedAt") FROM stdin;
cmgnxbnnw005pluj8hcas341d	cmgnxbnn5004iluj8b8v36xhs	cmgnxbnn1004cluj8ux23g3az	\N	5	\N	\N	\N	Fast shipping and beautiful products. Highly recommend!	2025-10-12 16:33:40.749	2025-10-12 16:33:40.749
\.


--
-- Data for Name: ShippingProfile; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."ShippingProfile" (id, "shopId", name, "processingTimeMin", "processingTimeMax", "shippingOrigin", "shippingRates", "carbonNeutralPrice", "createdAt", "updatedAt") FROM stdin;
cmgnxbnn5004jluj8udz35fqj	cmgnxbnn5004iluj8b8v36xhs	Standard Shipping	1	3	{"city": "Portland", "state": "OR", "country": "US", "address1": "123 Maker St", "postalCode": "97201"}	[{"rate": 5.99, "method": "standard", "region": "domestic", "estimatedDays": 5}, {"rate": 15.99, "method": "standard", "region": "international", "estimatedDays": 14}]	2	2025-10-12 16:33:40.721	2025-10-12 16:33:40.721
cmgnxbnnb004nluj891nlvpwv	cmgnxbnnb004mluj8wzoat9ov	Eco Shipping	2	5	{"city": "Seattle", "state": "WA", "country": "US", "address1": "456 Green Ave", "postalCode": "98101"}	[{"rate": 4.99, "method": "standard", "region": "domestic", "estimatedDays": 7}, {"rate": 12.99, "method": "standard", "region": "international", "estimatedDays": 12}]	1.5	2025-10-12 16:33:40.727	2025-10-12 16:33:40.727
cmgnxbnnd004rluj8v2rs3ump	cmgnxbnnc004qluj8hn13zqm2	Fresh Roast Shipping	1	2	{"city": "San Francisco", "state": "CA", "country": "US", "address1": "789 Coffee Lane", "postalCode": "94102"}	[{"rate": 6.99, "method": "standard", "region": "domestic", "estimatedDays": 4}, {"rate": 18.99, "method": "standard", "region": "international", "estimatedDays": 10}]	3	2025-10-12 16:33:40.729	2025-10-12 16:33:40.729
\.


--
-- Data for Name: Shop; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Shop" (id, "userId", slug, name, bio, story, "bannerImage", logo, colors, "isVerified", "verificationStatus", "stripeAccountId", "nonprofitId", "donationPercentage", "createdAt", "updatedAt") FROM stdin;
cmgnxbnn5004iluj8b8v36xhs	cmgnxbnn4004eluj86sgcv3xz	ecomaker-studio	EcoMaker Studio	Handcrafted sustainable goods made with organic materials. We believe in creating beautiful products that don't harm the planet.	\N	\N	https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400	\N	t	APPROVED	\N	cmgnxbnmu0047luj8lwso2fa7	5	2025-10-12 16:33:40.721	2025-10-12 16:33:40.721
cmgnxbnnb004mluj8wzoat9ov	cmgnxbnn4004fluj8sthy73ei	green-living-co	Green Living Co	Zero-waste products for modern sustainable living.	\N	\N	https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400	\N	t	APPROVED	\N	cmgnxbnmy004aluj826zduco5	3	2025-10-12 16:33:40.727	2025-10-12 16:33:40.727
cmgnxbnnc004qluj8hn13zqm2	cmgnxbnn4004gluj8v2fmi4v3	ethical-grounds	Ethical Grounds	Fair-trade organic coffee roasted with care.	\N	\N	https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400	\N	t	APPROVED	\N	cmgnxbnmy0049luj8d637pp74	7	2025-10-12 16:33:40.729	2025-10-12 16:33:40.729
cmgoe68z40003luqlos5i6dnr	user_33zLMr7pIgUWEYzTyFJzUGlhwqx	evercraft-1760315121903	Evercraft	We make stuff	\N	\N	\N	\N	f	PENDING	\N	\N	1	2025-10-13 00:25:21.904	2025-10-13 00:25:21.903
\.


--
-- Data for Name: ShopEcoProfile; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."ShopEcoProfile" (id, "shopId", "plasticFreePackaging", "recycledPackaging", "biodegradablePackaging", "organicMaterials", "recycledMaterials", "fairTradeSourcing", "localSourcing", "carbonNeutralShipping", "renewableEnergy", "carbonOffset", "annualCarbonEmissions", "carbonOffsetPercent", "renewableEnergyPercent", "waterConservation", "fairWageCertified", "takeBackProgram", "repairService", "completenessPercent", tier, "createdAt", "updatedAt") FROM stdin;
cmgnxbnn5004kluj8sqtjmwvt	cmgnxbnn5004iluj8b8v36xhs	t	t	f	t	t	t	t	t	f	t	\N	\N	50	t	t	f	f	69	verified	2025-10-12 16:33:40.721	2025-10-12 16:33:40.721
cmgnxbnnb004oluj8prkrmpgk	cmgnxbnnb004mluj8wzoat9ov	t	t	t	t	t	t	t	t	t	t	2.5	100	80	t	f	t	f	91	certified	2025-10-12 16:33:40.727	2025-10-12 16:33:40.727
cmgnxbnnd004sluj8se7npd9f	cmgnxbnnc004qluj8hn13zqm2	f	t	f	t	f	t	t	t	t	t	\N	\N	60	f	t	f	f	58	starter	2025-10-12 16:33:40.729	2025-10-12 16:33:40.729
cmgoe68z80005luqlugf1u5ws	cmgoe68z40003luqlos5i6dnr	t	t	t	t	f	f	f	f	f	f	13	30	25	t	f	t	f	49	starter	2025-10-13 00:25:21.909	2025-10-13 00:25:21.909
\.


--
-- Data for Name: ShopSection; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."ShopSection" (id, "shopId", name, slug, description, "position", "isVisible", "createdAt", "updatedAt") FROM stdin;
cmgpuvwgu0001lu3wh5ug96ch	cmgoe68z40003luqlos5i6dnr	glass	glass	\N	0	t	2025-10-14 01:00:58.782	2025-10-14 01:03:17.569
\.


--
-- Data for Name: ShopSectionProduct; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."ShopSectionProduct" (id, "sectionId", "productId", "position", "addedAt") FROM stdin;
cmgpvxbjh0009lu3wugt869lg	cmgpuvwgu0001lu3wh5ug96ch	cmgpvxbif0003lu3w4o6zlzu9	0	2025-10-14 01:30:04.589
cmgr0poxr000elu6pht5kxlqp	cmgpuvwgu0001lu3wh5ug96ch	cmgr0pox30007lu6pc00szl2s	0	2025-10-14 20:31:52.96
\.


--
-- Data for Name: SupportTicket; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."SupportTicket" (id, "userId", "orderId", subject, message, status, priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SustainabilityScore; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."SustainabilityScore" (id, "productId", "totalScore", "materialsScore", "packagingScore", "carbonScore", "certificationScore", "breakdownJson", "calculatedAt", "updatedAt") FROM stdin;
cmgnxbnnh0051luj845tdfyop	cmgnxbnnh004zluj8ce3kp2um	87	92	85	80	90	{"carbon": "Carbon offset through verified programs", "materials": "Organic cotton sourced from certified farms", "packaging": "Minimal, recyclable packaging", "certifications": "GOTS certified organic cotton"}	2025-10-12 16:33:40.733	2025-10-12 16:33:40.733
cmgnxbnnn0056luj8pokkd6ww	cmgnxbnnn0054luj8h0y3nw61	92	95	90	88	95	{"carbon": "Low carbon manufacturing process", "materials": "Fast-growing renewable bamboo", "packaging": "100% recycled and recyclable", "certifications": "FSC certified bamboo"}	2025-10-12 16:33:40.739	2025-10-12 16:33:40.739
cmgnxbnnq005bluj8utlb0imn	cmgnxbnnq0059luj876btzjym	78	85	70	75	82	{"carbon": "Carbon offset shipping program", "materials": "USDA Organic certified beans", "packaging": "Aluminum recyclable at most facilities", "certifications": "Fair Trade and Organic certified"}	2025-10-12 16:33:40.742	2025-10-12 16:33:40.742
cmgnxbnns005gluj88yapnl8s	cmgnxbnns005eluj8tx9reqfd	94	98	95	90	93	{"carbon": "Low energy production", "materials": "All natural, biodegradable ingredients", "packaging": "Fully compostable packaging", "certifications": "Certified organic cotton"}	2025-10-12 16:33:40.745	2025-10-12 16:33:40.745
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."User" (id, email, "emailVerified", name, avatar, phone, role, "twoFactorEnabled", "createdAt", "updatedAt") FROM stdin;
cmgnxbnn0004bluj8j2oopexg	admin@evercraft.com	\N	Admin User	\N	\N	ADMIN	f	2025-10-12 16:33:40.716	2025-10-12 16:33:40.716
cmgnxbnn1004cluj8ux23g3az	sarah@example.com	\N	Sarah Green	\N	\N	BUYER	f	2025-10-12 16:33:40.718	2025-10-12 16:33:40.718
cmgnxbnn4004eluj86sgcv3xz	alex@ecomaker.com	\N	Alex Martinez	\N	\N	SELLER	f	2025-10-12 16:33:40.72	2025-10-12 16:33:40.72
cmgnxbnn4004fluj8sthy73ei	maya@greenliving.com	\N	Maya Patel	\N	\N	SELLER	f	2025-10-12 16:33:40.72	2025-10-12 16:33:40.72
cmgnxbnn4004gluj8v2fmi4v3	james@ethicalgrounds.com	\N	James Chen	\N	\N	SELLER	f	2025-10-12 16:33:40.721	2025-10-12 16:33:40.721
user_33zLMr7pIgUWEYzTyFJzUGlhwqx	evercraft.eeko@gmail.com	2025-10-13 00:22:35.485	Benjamin Tyson	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zM3pMTW85bTBhbnM3Q2JjMHFNRzhCUkl0b2gifQ	\N	SELLER	f	2025-10-13 00:22:35.488	2025-10-13 00:25:21.913
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3c83dfd9-5ccf-4a1b-975c-8cf691c10e0e	85c62702adca7ea1b24c8398c27b8200a8970531bc83f545c14075411deb86bc	2025-10-06 09:11:54.918596-06	20251006151154_init	\N	\N	2025-10-06 09:11:54.796352-06	1
2c4d4597-5beb-43f7-9715-78b5b2b414e0	d8af4a4095b29debd0a619de1444ecb23561511b9ca8492a3dd66ffe74ff8df3	2025-10-06 21:15:24.644684-06	20251007031524_add_product_inventory	\N	\N	2025-10-06 21:15:24.640599-06	1
0bbb8d56-e086-417a-b7b5-828c385c6460	f48381e44144922b6b97311b6b089470ec19cfbef74664d2db07206d6746e6e9	2025-10-07 17:28:13.955412-06	20251007232813_add_shipping_tracking_fields	\N	\N	2025-10-07 17:28:13.953605-06	1
1a57c753-0b67-4727-ba36-61b567b6218c	5aae128c0745dea66b0ee1225198b0a061c8003400e61e2ec6b386a5966eb567	2025-10-10 18:06:32.440808-06	20251011000632_add_eco_profiles_v2	\N	\N	2025-10-10 18:06:32.416983-06	1
2a833d7f-a70e-474a-b394-f5d8b061a636	bc2e74960db97179906454b531acbd3dee1a971aafd6c51a282829dd643ce3bb	2025-10-11 14:55:35.570857-06	20251011205535_add_smart_gate_fields_to_seller_application	\N	\N	2025-10-11 14:55:35.56639-06	1
84fe8ee6-d9ea-406e-9c18-ab05e8fe4dbd	3b56de72f47df351311962fef23ce79eb9876194ce06a5c8d7008272ae4a1cd5	2025-10-13 14:10:15.305849-06	20251013201015_add_shop_sections	\N	\N	2025-10-13 14:10:15.292674-06	1
8677e3a2-b9ed-4055-91ea-014fb41a8fd3	80b6b65c7e610fcdd8caec0bb0c74c77672ba542f216705686bf426216440def	2025-10-13 20:01:58.345496-06	20251014020149_add_variant_options_to_product	\N	\N	2025-10-13 20:01:58.33892-06	1
\.


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: AnalyticsEvent AnalyticsEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."AnalyticsEvent"
    ADD CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Certification Certification_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Certification"
    ADD CONSTRAINT "Certification_pkey" PRIMARY KEY (id);


--
-- Name: CollectionProduct CollectionProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."CollectionProduct"
    ADD CONSTRAINT "CollectionProduct_pkey" PRIMARY KEY (id);


--
-- Name: Collection Collection_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Collection"
    ADD CONSTRAINT "Collection_pkey" PRIMARY KEY (id);


--
-- Name: Donation Donation_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_pkey" PRIMARY KEY (id);


--
-- Name: Favorite Favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Nonprofit Nonprofit_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Nonprofit"
    ADD CONSTRAINT "Nonprofit_pkey" PRIMARY KEY (id);


--
-- Name: NotificationPreference NotificationPreference_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."NotificationPreference"
    ADD CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductEcoProfile ProductEcoProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ProductEcoProfile"
    ADD CONSTRAINT "ProductEcoProfile_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Promotion Promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: SearchHistory SearchHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SearchHistory"
    ADD CONSTRAINT "SearchHistory_pkey" PRIMARY KEY (id);


--
-- Name: SellerApplication SellerApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SellerApplication"
    ADD CONSTRAINT "SellerApplication_pkey" PRIMARY KEY (id);


--
-- Name: SellerReview SellerReview_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SellerReview"
    ADD CONSTRAINT "SellerReview_pkey" PRIMARY KEY (id);


--
-- Name: ShippingProfile ShippingProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ShippingProfile"
    ADD CONSTRAINT "ShippingProfile_pkey" PRIMARY KEY (id);


--
-- Name: ShopEcoProfile ShopEcoProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ShopEcoProfile"
    ADD CONSTRAINT "ShopEcoProfile_pkey" PRIMARY KEY (id);


--
-- Name: ShopSectionProduct ShopSectionProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ShopSectionProduct"
    ADD CONSTRAINT "ShopSectionProduct_pkey" PRIMARY KEY (id);


--
-- Name: ShopSection ShopSection_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ShopSection"
    ADD CONSTRAINT "ShopSection_pkey" PRIMARY KEY (id);


--
-- Name: Shop Shop_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Shop"
    ADD CONSTRAINT "Shop_pkey" PRIMARY KEY (id);


--
-- Name: SupportTicket SupportTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY (id);


--
-- Name: SustainabilityScore SustainabilityScore_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SustainabilityScore"
    ADD CONSTRAINT "SustainabilityScore_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Address_isDefault_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Address_isDefault_idx" ON public."Address" USING btree ("isDefault");


--
-- Name: Address_userId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Address_userId_idx" ON public."Address" USING btree ("userId");


--
-- Name: AnalyticsEvent_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "AnalyticsEvent_createdAt_idx" ON public."AnalyticsEvent" USING btree ("createdAt");


--
-- Name: AnalyticsEvent_eventType_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "AnalyticsEvent_eventType_idx" ON public."AnalyticsEvent" USING btree ("eventType");


--
-- Name: AnalyticsEvent_shopId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "AnalyticsEvent_shopId_idx" ON public."AnalyticsEvent" USING btree ("shopId");


--
-- Name: AnalyticsEvent_userId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "AnalyticsEvent_userId_idx" ON public."AnalyticsEvent" USING btree ("userId");


--
-- Name: Category_parentId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Category_parentId_idx" ON public."Category" USING btree ("parentId");


--
-- Name: Category_position_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Category_position_idx" ON public."Category" USING btree ("position");


--
-- Name: Category_slug_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Category_slug_idx" ON public."Category" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Certification_productId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Certification_productId_idx" ON public."Certification" USING btree ("productId");


--
-- Name: Certification_type_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Certification_type_idx" ON public."Certification" USING btree (type);


--
-- Name: Certification_verified_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Certification_verified_idx" ON public."Certification" USING btree (verified);


--
-- Name: CollectionProduct_collectionId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "CollectionProduct_collectionId_idx" ON public."CollectionProduct" USING btree ("collectionId");


--
-- Name: CollectionProduct_collectionId_productId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "CollectionProduct_collectionId_productId_key" ON public."CollectionProduct" USING btree ("collectionId", "productId");


--
-- Name: CollectionProduct_productId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "CollectionProduct_productId_idx" ON public."CollectionProduct" USING btree ("productId");


--
-- Name: Collection_isPublic_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Collection_isPublic_idx" ON public."Collection" USING btree ("isPublic");


--
-- Name: Collection_userId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Collection_userId_idx" ON public."Collection" USING btree ("userId");


--
-- Name: Donation_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Donation_createdAt_idx" ON public."Donation" USING btree ("createdAt");


--
-- Name: Donation_nonprofitId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Donation_nonprofitId_idx" ON public."Donation" USING btree ("nonprofitId");


--
-- Name: Donation_orderId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Donation_orderId_idx" ON public."Donation" USING btree ("orderId");


--
-- Name: Donation_status_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Donation_status_idx" ON public."Donation" USING btree (status);


--
-- Name: Favorite_productId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Favorite_productId_idx" ON public."Favorite" USING btree ("productId");


--
-- Name: Favorite_userId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Favorite_userId_idx" ON public."Favorite" USING btree ("userId");


--
-- Name: Favorite_userId_productId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Favorite_userId_productId_key" ON public."Favorite" USING btree ("userId", "productId");


--
-- Name: Message_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Message_createdAt_idx" ON public."Message" USING btree ("createdAt");


--
-- Name: Message_fromUserId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Message_fromUserId_idx" ON public."Message" USING btree ("fromUserId");


--
-- Name: Message_isRead_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Message_isRead_idx" ON public."Message" USING btree ("isRead");


--
-- Name: Message_toUserId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Message_toUserId_idx" ON public."Message" USING btree ("toUserId");


--
-- Name: Nonprofit_ein_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Nonprofit_ein_idx" ON public."Nonprofit" USING btree (ein);


--
-- Name: Nonprofit_ein_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Nonprofit_ein_key" ON public."Nonprofit" USING btree (ein);


--
-- Name: Nonprofit_isVerified_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Nonprofit_isVerified_idx" ON public."Nonprofit" USING btree ("isVerified");


--
-- Name: Nonprofit_stripeAccountId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Nonprofit_stripeAccountId_key" ON public."Nonprofit" USING btree ("stripeAccountId");


--
-- Name: NotificationPreference_userId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON public."NotificationPreference" USING btree ("userId");


--
-- Name: OrderItem_nonprofitId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "OrderItem_nonprofitId_idx" ON public."OrderItem" USING btree ("nonprofitId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");


--
-- Name: OrderItem_shopId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "OrderItem_shopId_idx" ON public."OrderItem" USING btree ("shopId");


--
-- Name: Order_buyerId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Order_buyerId_idx" ON public."Order" USING btree ("buyerId");


--
-- Name: Order_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Order_createdAt_idx" ON public."Order" USING btree ("createdAt");


--
-- Name: Order_orderNumber_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Order_orderNumber_idx" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_paymentIntentId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Order_paymentIntentId_key" ON public."Order" USING btree ("paymentIntentId");


--
-- Name: Order_paymentStatus_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Order_paymentStatus_idx" ON public."Order" USING btree ("paymentStatus");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Payment_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Payment_createdAt_idx" ON public."Payment" USING btree ("createdAt");


--
-- Name: Payment_orderId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Payment_orderId_idx" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_status_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Payment_status_idx" ON public."Payment" USING btree (status);


--
-- Name: Payment_stripePaymentIntentId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON public."Payment" USING btree ("stripePaymentIntentId");


--
-- Name: ProductEcoProfile_carbonNeutralShipping_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ProductEcoProfile_carbonNeutralShipping_idx" ON public."ProductEcoProfile" USING btree ("carbonNeutralShipping");


--
-- Name: ProductEcoProfile_completenessPercent_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ProductEcoProfile_completenessPercent_idx" ON public."ProductEcoProfile" USING btree ("completenessPercent");


--
-- Name: ProductEcoProfile_isOrganic_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ProductEcoProfile_isOrganic_idx" ON public."ProductEcoProfile" USING btree ("isOrganic");


--
-- Name: ProductEcoProfile_plasticFreePackaging_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ProductEcoProfile_plasticFreePackaging_idx" ON public."ProductEcoProfile" USING btree ("plasticFreePackaging");


--
-- Name: ProductEcoProfile_productId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ProductEcoProfile_productId_idx" ON public."ProductEcoProfile" USING btree ("productId");


--
-- Name: ProductEcoProfile_productId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "ProductEcoProfile_productId_key" ON public."ProductEcoProfile" USING btree ("productId");


--
-- Name: ProductImage_isPrimary_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ProductImage_isPrimary_idx" ON public."ProductImage" USING btree ("isPrimary");


--
-- Name: ProductImage_productId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ProductImage_productId_idx" ON public."ProductImage" USING btree ("productId");


--
-- Name: ProductVariant_productId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ProductVariant_productId_idx" ON public."ProductVariant" USING btree ("productId");


--
-- Name: ProductVariant_sku_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ProductVariant_sku_idx" ON public."ProductVariant" USING btree (sku);


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Product_createdAt_idx" ON public."Product" USING btree ("createdAt");


--
-- Name: Product_ecoScore_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Product_ecoScore_idx" ON public."Product" USING btree ("ecoScore");


--
-- Name: Product_hasVariants_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Product_hasVariants_idx" ON public."Product" USING btree ("hasVariants");


--
-- Name: Product_shopId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Product_shopId_idx" ON public."Product" USING btree ("shopId");


--
-- Name: Product_status_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Product_status_idx" ON public."Product" USING btree (status);


--
-- Name: Promotion_code_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Promotion_code_idx" ON public."Promotion" USING btree (code);


--
-- Name: Promotion_code_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Promotion_code_key" ON public."Promotion" USING btree (code);


--
-- Name: Promotion_endDate_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Promotion_endDate_idx" ON public."Promotion" USING btree ("endDate");


--
-- Name: Promotion_isActive_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Promotion_isActive_idx" ON public."Promotion" USING btree ("isActive");


--
-- Name: Promotion_shopId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Promotion_shopId_idx" ON public."Promotion" USING btree ("shopId");


--
-- Name: Review_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Review_createdAt_idx" ON public."Review" USING btree ("createdAt");


--
-- Name: Review_isVerifiedPurchase_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Review_isVerifiedPurchase_idx" ON public."Review" USING btree ("isVerifiedPurchase");


--
-- Name: Review_productId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Review_productId_idx" ON public."Review" USING btree ("productId");


--
-- Name: Review_rating_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Review_rating_idx" ON public."Review" USING btree (rating);


--
-- Name: Review_userId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Review_userId_idx" ON public."Review" USING btree ("userId");


--
-- Name: SearchHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SearchHistory_createdAt_idx" ON public."SearchHistory" USING btree ("createdAt");


--
-- Name: SearchHistory_query_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SearchHistory_query_idx" ON public."SearchHistory" USING btree (query);


--
-- Name: SearchHistory_userId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SearchHistory_userId_idx" ON public."SearchHistory" USING btree ("userId");


--
-- Name: SellerApplication_completenessScore_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerApplication_completenessScore_idx" ON public."SellerApplication" USING btree ("completenessScore");


--
-- Name: SellerApplication_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerApplication_createdAt_idx" ON public."SellerApplication" USING btree ("createdAt");


--
-- Name: SellerApplication_status_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerApplication_status_idx" ON public."SellerApplication" USING btree (status);


--
-- Name: SellerApplication_tier_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerApplication_tier_idx" ON public."SellerApplication" USING btree (tier);


--
-- Name: SellerApplication_userId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerApplication_userId_idx" ON public."SellerApplication" USING btree ("userId");


--
-- Name: SellerReview_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerReview_createdAt_idx" ON public."SellerReview" USING btree ("createdAt");


--
-- Name: SellerReview_rating_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerReview_rating_idx" ON public."SellerReview" USING btree (rating);


--
-- Name: SellerReview_shopId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerReview_shopId_idx" ON public."SellerReview" USING btree ("shopId");


--
-- Name: SellerReview_userId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerReview_userId_idx" ON public."SellerReview" USING btree ("userId");


--
-- Name: ShippingProfile_shopId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ShippingProfile_shopId_idx" ON public."ShippingProfile" USING btree ("shopId");


--
-- Name: ShopEcoProfile_completenessPercent_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ShopEcoProfile_completenessPercent_idx" ON public."ShopEcoProfile" USING btree ("completenessPercent");


--
-- Name: ShopEcoProfile_shopId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ShopEcoProfile_shopId_idx" ON public."ShopEcoProfile" USING btree ("shopId");


--
-- Name: ShopEcoProfile_shopId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "ShopEcoProfile_shopId_key" ON public."ShopEcoProfile" USING btree ("shopId");


--
-- Name: ShopEcoProfile_tier_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ShopEcoProfile_tier_idx" ON public."ShopEcoProfile" USING btree (tier);


--
-- Name: ShopSectionProduct_productId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ShopSectionProduct_productId_idx" ON public."ShopSectionProduct" USING btree ("productId");


--
-- Name: ShopSectionProduct_sectionId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ShopSectionProduct_sectionId_idx" ON public."ShopSectionProduct" USING btree ("sectionId");


--
-- Name: ShopSectionProduct_sectionId_productId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "ShopSectionProduct_sectionId_productId_key" ON public."ShopSectionProduct" USING btree ("sectionId", "productId");


--
-- Name: ShopSection_isVisible_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ShopSection_isVisible_idx" ON public."ShopSection" USING btree ("isVisible");


--
-- Name: ShopSection_position_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ShopSection_position_idx" ON public."ShopSection" USING btree ("position");


--
-- Name: ShopSection_shopId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "ShopSection_shopId_idx" ON public."ShopSection" USING btree ("shopId");


--
-- Name: ShopSection_shopId_slug_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "ShopSection_shopId_slug_key" ON public."ShopSection" USING btree ("shopId", slug);


--
-- Name: Shop_isVerified_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Shop_isVerified_idx" ON public."Shop" USING btree ("isVerified");


--
-- Name: Shop_nonprofitId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Shop_nonprofitId_idx" ON public."Shop" USING btree ("nonprofitId");


--
-- Name: Shop_slug_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Shop_slug_idx" ON public."Shop" USING btree (slug);


--
-- Name: Shop_slug_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Shop_slug_key" ON public."Shop" USING btree (slug);


--
-- Name: Shop_stripeAccountId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Shop_stripeAccountId_key" ON public."Shop" USING btree ("stripeAccountId");


--
-- Name: Shop_userId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "Shop_userId_idx" ON public."Shop" USING btree ("userId");


--
-- Name: Shop_userId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "Shop_userId_key" ON public."Shop" USING btree ("userId");


--
-- Name: SupportTicket_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SupportTicket_createdAt_idx" ON public."SupportTicket" USING btree ("createdAt");


--
-- Name: SupportTicket_priority_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SupportTicket_priority_idx" ON public."SupportTicket" USING btree (priority);


--
-- Name: SupportTicket_status_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SupportTicket_status_idx" ON public."SupportTicket" USING btree (status);


--
-- Name: SupportTicket_userId_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SupportTicket_userId_idx" ON public."SupportTicket" USING btree ("userId");


--
-- Name: SustainabilityScore_productId_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "SustainabilityScore_productId_key" ON public."SustainabilityScore" USING btree ("productId");


--
-- Name: SustainabilityScore_totalScore_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SustainabilityScore_totalScore_idx" ON public."SustainabilityScore" USING btree ("totalScore");


--
-- Name: SustainabilityScore_updatedAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SustainabilityScore_updatedAt_idx" ON public."SustainabilityScore" USING btree ("updatedAt");


--
-- Name: User_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "User_createdAt_idx" ON public."User" USING btree ("createdAt");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AnalyticsEvent AnalyticsEvent_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."AnalyticsEvent"
    ADD CONSTRAINT "AnalyticsEvent_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AnalyticsEvent AnalyticsEvent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."AnalyticsEvent"
    ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Certification Certification_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Certification"
    ADD CONSTRAINT "Certification_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CollectionProduct CollectionProduct_collectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."CollectionProduct"
    ADD CONSTRAINT "CollectionProduct_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES public."Collection"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CollectionProduct CollectionProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."CollectionProduct"
    ADD CONSTRAINT "CollectionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Collection Collection_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Collection"
    ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Donation Donation_nonprofitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES public."Nonprofit"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Favorite Favorite_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_fromUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_toUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: NotificationPreference NotificationPreference_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."NotificationPreference"
    ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_nonprofitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES public."Nonprofit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductEcoProfile ProductEcoProfile_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ProductEcoProfile"
    ADD CONSTRAINT "ProductEcoProfile_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariant ProductVariant_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."ProductImage"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Promotion Promotion_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SearchHistory SearchHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SearchHistory"
    ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SellerApplication SellerApplication_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SellerApplication"
    ADD CONSTRAINT "SellerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReview SellerReview_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SellerReview"
    ADD CONSTRAINT "SellerReview_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerReview SellerReview_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SellerReview"
    ADD CONSTRAINT "SellerReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ShippingProfile ShippingProfile_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ShippingProfile"
    ADD CONSTRAINT "ShippingProfile_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShopEcoProfile ShopEcoProfile_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ShopEcoProfile"
    ADD CONSTRAINT "ShopEcoProfile_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShopSectionProduct ShopSectionProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ShopSectionProduct"
    ADD CONSTRAINT "ShopSectionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShopSectionProduct ShopSectionProduct_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ShopSectionProduct"
    ADD CONSTRAINT "ShopSectionProduct_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."ShopSection"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShopSection ShopSection_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."ShopSection"
    ADD CONSTRAINT "ShopSection_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Shop Shop_nonprofitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Shop"
    ADD CONSTRAINT "Shop_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES public."Nonprofit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Shop Shop_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."Shop"
    ADD CONSTRAINT "Shop_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportTicket SupportTicket_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SustainabilityScore SustainabilityScore_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bentyson
--

ALTER TABLE ONLY public."SustainabilityScore"
    ADD CONSTRAINT "SustainabilityScore_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

