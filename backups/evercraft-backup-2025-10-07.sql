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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    "updatedAt" timestamp(3) without time zone NOT NULL
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
    "trackInventory" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Product" OWNER TO bentyson;

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
    "updatedAt" timestamp(3) without time zone NOT NULL
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
cmgfqyz8h000bluxlojx3rxxf	cmgfqyz8h000aluxli5fjizks	shipping	Sarah	Green	\N	123 Eco Street	\N	Portland	OR	97201	US	\N	t	2025-10-06 23:13:42.113	2025-10-06 23:13:42.113
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
cmgfqyz810000luxl605a84dz	\N	Kitchen & Dining	kitchen-dining	Eco-friendly kitchenware and dining essentials	\N	\N	\N	1	2025-10-06 23:13:42.097	2025-10-06 23:13:42.097
cmgfqyz880001luxli267755r	\N	Home & Living	home-living	Sustainable home goods and decor	\N	\N	\N	0	2025-10-06 23:13:42.097	2025-10-06 23:13:42.097
cmgfqyz890002luxlyuh8t1nw	\N	Food & Beverages	food-beverages	Organic and fair-trade food products	\N	\N	\N	4	2025-10-06 23:13:42.097	2025-10-06 23:13:42.097
cmgfqyz890003luxldssmlwrf	\N	Fashion & Accessories	fashion-accessories	Sustainable clothing and accessories	\N	\N	\N	3	2025-10-06 23:13:42.097	2025-10-06 23:13:42.097
cmgfqyz8a0004luxlfb8rdr12	\N	Personal Care	personal-care	Natural and organic personal care products	\N	\N	\N	2	2025-10-06 23:13:42.097	2025-10-06 23:13:42.097
\.


--
-- Data for Name: Certification; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Certification" (id, "productId", "shopId", name, type, "issuedBy", "issuedDate", "expiryDate", certificate, verified, "createdAt") FROM stdin;
cmgfqyz90000pluxl997ux8j1	\N	\N	Carbon Neutral	product	Evercraft Verification Team	\N	\N	\N	t	2025-10-06 23:13:42.132
cmgfqyz91000rluxlsc0jtopt	cmgfqyz9b0016luxln5u9891v	\N	USDA Organic	product	US Department of Agriculture	\N	\N	\N	t	2025-10-06 23:13:42.133
cmgfqyz90000qluxl31vph8v0	cmgfwm5to0001luu115n59ir4	\N	Fair Trade Certified	product	Fair Trade International	\N	\N	\N	t	2025-10-06 23:13:42.133
cmgfqyz91000sluxllx1jvd1i	cmgfwm5to0001luu115n59ir4	\N	Zero Waste	product	Evercraft Verification Team	\N	\N	\N	t	2025-10-06 23:13:42.133
cmgfqyz8y000oluxltiktxcds	cmgfwm5to0001luu115n59ir4	\N	Plastic Free	product	Evercraft Verification Team	\N	\N	\N	t	2025-10-06 23:13:42.13
\.


--
-- Data for Name: Collection; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Collection" (id, "userId", name, description, "isPublic", "createdAt", "updatedAt") FROM stdin;
cmgfqyz9h001iluxlh29ys6ta	cmgfqyz8h000aluxli5fjizks	My Wishlist	\N	f	2025-10-06 23:13:42.15	2025-10-06 23:13:42.15
\.


--
-- Data for Name: CollectionProduct; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."CollectionProduct" (id, "collectionId", "productId", "createdAt") FROM stdin;
cmgfqyz9h001kluxlatiaizio	cmgfqyz9h001iluxlh29ys6ta	cmgfqyz92000uluxlemv4amcd	2025-10-06 23:13:42.15
cmgfqyz9h001lluxlc25kgeuw	cmgfqyz9h001iluxlh29ys6ta	cmgfqyz9b0016luxln5u9891v	2025-10-06 23:13:42.15
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
cmgfqyz8c0005luxl4gd26o7p	Ocean Conservancy	23-7245152	Ocean Conservancy works to protect the ocean from today's greatest global challenges.	\N	\N	https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200	\N	https://oceanconservancy.org	\N	t	\N	2025-10-06 23:13:42.108	2025-10-06 23:13:42.108
cmgfqyz8c0006luxlo4mzg586	Rainforest Alliance	13-3377893	Creating a more sustainable world by using social and market forces.	\N	\N	https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200	\N	https://www.rainforest-alliance.org	\N	t	\N	2025-10-06 23:13:42.108	2025-10-06 23:13:42.108
cmgfqyz8c0008luxlk5mhaof3	Fair Trade Federation	52-2106638	Strengthening and promoting organizations fully committed to Fair Trade.	\N	\N	https://images.unsplash.com/photo-1542838132-92c53300491e?w=200	\N	https://www.fairtradefederation.org	\N	t	\N	2025-10-06 23:13:42.108	2025-10-06 23:13:42.108
cmgfqyz8c0007luxlg8bh15v2	The Nature Conservancy	53-0242652	Conserving the lands and waters on which all life depends.	\N	\N	https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200	\N	https://www.nature.org	\N	t	\N	2025-10-06 23:13:42.108	2025-10-06 23:13:42.108
\.


--
-- Data for Name: NotificationPreference; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."NotificationPreference" (id, "userId", "emailMarketing", "emailOrderUpdates", "emailMessages", "emailReviews", "pushNotifications", "smsNotifications", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Order" (id, "orderNumber", "buyerId", status, subtotal, "shippingCost", tax, total, "nonprofitDonation", "shippingAddress", "billingAddress", "paymentStatus", "paymentIntentId", "createdAt", "updatedAt") FROM stdin;
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

COPY public."Product" (id, "shopId", title, description, price, "compareAtPrice", sku, "categoryId", tags, status, "ecoScore", "ecoAttributes", "metaTitle", "metaDescription", "createdAt", "updatedAt", "inventoryQuantity", "lowStockThreshold", "trackInventory") FROM stdin;
cmgfqyz92000uluxlemv4amcd	cmgfqyz8n000gluxlmksre0qu	Organic Cotton Tote Bag - Reusable Shopping Bag	Durable, reusable tote bag made from 100% organic cotton. Perfect for grocery shopping, beach trips, or everyday use. Holds up to 30 lbs.	24.99	34.99	\N	cmgfqyz880001luxli267755r	\N	ACTIVE	\N	{"lifespan": "5+ years with proper care", "material": "100% Organic Cotton", "packaging": "Compostable", "carbonFootprint": "Offset through tree planting"}	\N	\N	2025-10-06 23:13:42.134	2025-10-06 23:13:42.134	0	\N	t
cmgfqyz97000yluxlrfafwzmx	cmgfqyz8u000jluxlpypnso6y	Bamboo Cutlery Set - Zero Waste Travel Utensils	Complete bamboo cutlery set with fork, knife, spoon, and chopsticks. Comes in a compact carrying case. Perfect for on-the-go meals.	18.5	\N	\N	cmgfqyz810000luxl605a84dz	\N	ACTIVE	\N	{"lifespan": "3+ years", "material": "Sustainably harvested bamboo", "packaging": "Recycled cardboard", "carbonFootprint": "Low impact production"}	\N	\N	2025-10-06 23:13:42.14	2025-10-06 23:13:42.14	0	\N	t
cmgfqyz9a0012luxlt0cchee3	cmgfqyz8v000mluxlbktgp89q	Fair Trade Organic Coffee Beans - 12oz Dark Roast	Rich, bold dark roast coffee beans from Fair Trade certified farms. Notes of chocolate and caramel. Roasted fresh to order.	15.99	\N	\N	cmgfqyz890002luxlyuh8t1nw	\N	ACTIVE	\N	{"origin": "Small farms in Colombia", "material": "Organic coffee beans", "packaging": "Recyclable aluminum bag", "carbonFootprint": "Carbon neutral shipping"}	\N	\N	2025-10-06 23:13:42.142	2025-10-06 23:13:42.142	0	\N	t
cmgfqyz9b0016luxln5u9891v	cmgfqyz8n000gluxlmksre0qu	Reusable Beeswax Food Wraps - Set of 3	Natural alternative to plastic wrap. Made with organic cotton, beeswax, jojoba oil, and tree resin. Washable and reusable for up to a year.	22	\N	\N	cmgfqyz810000luxl605a84dz	\N	ACTIVE	\N	{"lifespan": "1 year with regular use", "material": "Organic cotton, beeswax, jojoba oil", "packaging": "Compostable paper", "carbonFootprint": "Minimal"}	\N	\N	2025-10-06 23:13:42.144	2025-10-06 23:13:42.144	0	\N	t
cmgfwm5to0001luu115n59ir4	cmgfwfnux0001lucgi4sb9tr6	asdfasasdfasdf	asdfas	13	14	asdf	cmgfqyz810000luxl605a84dz	{}	ACTIVE	\N	{}	\N	\N	2025-10-07 01:51:41.819	2025-10-07 02:14:33.236	0	\N	t
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."ProductImage" (id, "productId", url, "altText", "position", "isPrimary", "createdAt") FROM stdin;
cmgfqyz92000vluxlvey9guvo	cmgfqyz92000uluxlemv4amcd	https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80	Organic cotton tote bag - front view	0	t	2025-10-06 23:13:42.134
cmgfqyz98000zluxlsp2e03w9	cmgfqyz97000yluxlrfafwzmx	https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80	Bamboo cutlery set with carrying case	0	t	2025-10-06 23:13:42.14
cmgfqyz9a0013luxlymyls49p	cmgfqyz9a0012luxlt0cchee3	https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80	Fair trade organic coffee beans	0	t	2025-10-06 23:13:42.142
cmgfqyz9b0017luxlxltkscu0	cmgfqyz9b0016luxln5u9891v	https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80	Colorful beeswax food wraps	0	t	2025-10-06 23:13:42.144
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."ProductVariant" (id, "productId", name, sku, price, "inventoryQuantity", "trackInventory", "imageId", "createdAt", "updatedAt") FROM stdin;
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
cmgfqyz9e001aluxloi3gnppv	cmgfqyz92000uluxlemv4amcd	cmgfqyz8h000aluxli5fjizks	\N	5	Love this tote! This tote bag is exactly what I was looking for. It's sturdy, beautiful, and I feel good using it instead of plastic bags.	\N	t	0	2025-10-06 23:13:42.146	2025-10-06 23:13:42.146
cmgfqyz9f001cluxle8chcxv2	cmgfqyz97000yluxlrfafwzmx	cmgfqyz8h000aluxli5fjizks	\N	5	Perfect for travel. I take this everywhere now. No more plastic utensils! The bamboo is smooth and well-made.	\N	t	0	2025-10-06 23:13:42.148	2025-10-06 23:13:42.148
cmgfqyz9g001eluxlknb8qal6	cmgfqyz9a0012luxlt0cchee3	cmgfqyz8h000aluxli5fjizks	\N	4	Great coffee, great cause. Delicious dark roast with a smooth finish. Love that it supports fair trade farmers.	\N	t	0	2025-10-06 23:13:42.148	2025-10-06 23:13:42.148
\.


--
-- Data for Name: SearchHistory; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."SearchHistory" (id, "userId", query, filters, results, clicked, "createdAt") FROM stdin;
\.


--
-- Data for Name: SellerApplication; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."SellerApplication" (id, "userId", "businessName", "businessWebsite", "businessDescription", "ecoQuestions", "preferredNonprofit", "donationPercentage", status, "reviewNotes", "reviewedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SellerReview; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."SellerReview" (id, "shopId", "userId", "orderId", rating, "shippingSpeedRating", "communicationRating", "itemAsDescribedRating", text, "createdAt", "updatedAt") FROM stdin;
cmgfqyz9g001gluxld8cadsdf	cmgfqyz8n000gluxlmksre0qu	cmgfqyz8h000aluxli5fjizks	\N	5	\N	\N	\N	Fast shipping and beautiful products. Highly recommend!	2025-10-06 23:13:42.149	2025-10-06 23:13:42.149
\.


--
-- Data for Name: ShippingProfile; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."ShippingProfile" (id, "shopId", name, "processingTimeMin", "processingTimeMax", "shippingOrigin", "shippingRates", "carbonNeutralPrice", "createdAt", "updatedAt") FROM stdin;
cmgfqyz8n000hluxle5bvlbdy	cmgfqyz8n000gluxlmksre0qu	Standard Shipping	1	3	{"city": "Portland", "state": "OR", "country": "US", "address1": "123 Maker St", "postalCode": "97201"}	[{"rate": 5.99, "method": "standard", "region": "domestic", "estimatedDays": 5}, {"rate": 15.99, "method": "standard", "region": "international", "estimatedDays": 14}]	2	2025-10-06 23:13:42.119	2025-10-06 23:13:42.119
cmgfqyz8u000kluxl27as33cd	cmgfqyz8u000jluxlpypnso6y	Eco Shipping	2	5	{"city": "Seattle", "state": "WA", "country": "US", "address1": "456 Green Ave", "postalCode": "98101"}	[{"rate": 4.99, "method": "standard", "region": "domestic", "estimatedDays": 7}, {"rate": 12.99, "method": "standard", "region": "international", "estimatedDays": 12}]	1.5	2025-10-06 23:13:42.126	2025-10-06 23:13:42.126
cmgfqyz8v000nluxlo5hyy0fj	cmgfqyz8v000mluxlbktgp89q	Fresh Roast Shipping	1	2	{"city": "San Francisco", "state": "CA", "country": "US", "address1": "789 Coffee Lane", "postalCode": "94102"}	[{"rate": 6.99, "method": "standard", "region": "domestic", "estimatedDays": 4}, {"rate": 18.99, "method": "standard", "region": "international", "estimatedDays": 10}]	3	2025-10-06 23:13:42.128	2025-10-06 23:13:42.128
\.


--
-- Data for Name: Shop; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."Shop" (id, "userId", slug, name, bio, story, "bannerImage", logo, colors, "isVerified", "verificationStatus", "stripeAccountId", "nonprofitId", "donationPercentage", "createdAt", "updatedAt") FROM stdin;
cmgfqyz8n000gluxlmksre0qu	cmgfqyz8l000cluxlbjiexpzd	ecomaker-studio	EcoMaker Studio	Handcrafted sustainable goods made with organic materials. We believe in creating beautiful products that don't harm the planet.	\N	\N	https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400	\N	t	PENDING	\N	cmgfqyz8c0005luxl4gd26o7p	5	2025-10-06 23:13:42.119	2025-10-06 23:13:42.119
cmgfqyz8u000jluxlpypnso6y	cmgfqyz8l000dluxlancsz1rl	green-living-co	Green Living Co	Zero-waste products for modern sustainable living.	\N	\N	https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400	\N	t	PENDING	\N	cmgfqyz8c0006luxlo4mzg586	3	2025-10-06 23:13:42.126	2025-10-06 23:13:42.126
cmgfqyz8v000mluxlbktgp89q	cmgfqyz8m000eluxlvxgoxsll	ethical-grounds	Ethical Grounds	Fair-trade organic coffee roasted with care.	\N	\N	https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400	\N	t	PENDING	\N	cmgfqyz8c0008luxlk5mhaof3	7	2025-10-06 23:13:42.128	2025-10-06 23:13:42.128
cmgfwfnux0001lucgi4sb9tr6	user_33iWahuOgcoqSwOtrrKJHdj1z99	my-eco-shop	My Eco Shop	A sustainable shop selling eco-friendly products	\N	\N	\N	\N	t	APPROVED	\N	\N	5	2025-10-07 01:46:38.602	2025-10-07 01:46:38.602
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
cmgfqyz92000wluxl5k768krp	cmgfqyz92000uluxlemv4amcd	87	92	85	80	90	{"carbon": "Carbon offset through verified programs", "materials": "Organic cotton sourced from certified farms", "packaging": "Minimal, recyclable packaging", "certifications": "GOTS certified organic cotton"}	2025-10-06 23:13:42.134	2025-10-06 23:13:42.134
cmgfqyz980010luxlboeemcoz	cmgfqyz97000yluxlrfafwzmx	92	95	90	88	95	{"carbon": "Low carbon manufacturing process", "materials": "Fast-growing renewable bamboo", "packaging": "100% recycled and recyclable", "certifications": "FSC certified bamboo"}	2025-10-06 23:13:42.14	2025-10-06 23:13:42.14
cmgfqyz9a0014luxl64xmq9sv	cmgfqyz9a0012luxlt0cchee3	78	85	70	75	82	{"carbon": "Carbon offset shipping program", "materials": "USDA Organic certified beans", "packaging": "Aluminum recyclable at most facilities", "certifications": "Fair Trade and Organic certified"}	2025-10-06 23:13:42.142	2025-10-06 23:13:42.142
cmgfqyz9b0018luxlk827h8d8	cmgfqyz9b0016luxln5u9891v	94	98	95	90	93	{"carbon": "Low energy production", "materials": "All natural, biodegradable ingredients", "packaging": "Fully compostable packaging", "certifications": "Certified organic cotton"}	2025-10-06 23:13:42.144	2025-10-06 23:13:42.144
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public."User" (id, email, "emailVerified", name, avatar, phone, role, "twoFactorEnabled", "createdAt", "updatedAt") FROM stdin;
cmgfqyz8e0009luxli5n0kgmr	admin@evercraft.com	\N	Admin User	\N	\N	ADMIN	f	2025-10-06 23:13:42.111	2025-10-06 23:13:42.111
cmgfqyz8h000aluxli5fjizks	sarah@example.com	\N	Sarah Green	\N	\N	BUYER	f	2025-10-06 23:13:42.113	2025-10-06 23:13:42.113
cmgfqyz8l000cluxlbjiexpzd	alex@ecomaker.com	\N	Alex Martinez	\N	\N	SELLER	f	2025-10-06 23:13:42.117	2025-10-06 23:13:42.117
cmgfqyz8l000dluxlancsz1rl	maya@greenliving.com	\N	Maya Patel	\N	\N	SELLER	f	2025-10-06 23:13:42.118	2025-10-06 23:13:42.118
cmgfqyz8m000eluxlvxgoxsll	james@ethicalgrounds.com	\N	James Chen	\N	\N	SELLER	f	2025-10-06 23:13:42.118	2025-10-06 23:13:42.118
user_33iWahuOgcoqSwOtrrKJHdj1z99	seller@evercraft.com	\N	Eco Seller	\N	\N	BUYER	f	2025-10-07 01:46:38.593	2025-10-07 01:46:38.593
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: bentyson
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3c83dfd9-5ccf-4a1b-975c-8cf691c10e0e	85c62702adca7ea1b24c8398c27b8200a8970531bc83f545c14075411deb86bc	2025-10-06 09:11:54.918596-06	20251006151154_init	\N	\N	2025-10-06 09:11:54.796352-06	1
2c4d4597-5beb-43f7-9715-78b5b2b414e0	d8af4a4095b29debd0a619de1444ecb23561511b9ca8492a3dd66ffe74ff8df3	2025-10-06 21:15:24.644684-06	20251007031524_add_product_inventory	\N	\N	2025-10-06 21:15:24.640599-06	1
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
-- Name: SellerApplication_createdAt_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerApplication_createdAt_idx" ON public."SellerApplication" USING btree ("createdAt");


--
-- Name: SellerApplication_status_idx; Type: INDEX; Schema: public; Owner: bentyson
--

CREATE INDEX "SellerApplication_status_idx" ON public."SellerApplication" USING btree (status);


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

