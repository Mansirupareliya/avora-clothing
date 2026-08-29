--
-- PostgreSQL database dump
--

\restrict bK2SQ1Tbhyf8xW82yG316QR7pydNPb5s02jFMSBRUjIXQ3fjq3KX9JjhaWA2hck

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Cart" (
);


--
-- Name: analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics (
    id integer NOT NULL,
    date character varying(10) NOT NULL,
    hour integer DEFAULT 0 NOT NULL,
    "pageViews" integer DEFAULT 0 NOT NULL,
    "productClicks" integer DEFAULT 0 NOT NULL,
    "ordersCount" integer DEFAULT 0 NOT NULL,
    "salesAmount" numeric(12,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.analytics_id_seq OWNED BY public.analytics.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "productName" character varying NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    size character varying,
    category character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "productId" integer NOT NULL,
    "imageUrl" text
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying,
    items jsonb NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    "shippingAddress" jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "orderNumber" integer,
    "orderId" character varying
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text NOT NULL,
    mrp numeric(10,2) NOT NULL,
    discount numeric(10,2) NOT NULL,
    price numeric(10,2) NOT NULL,
    "imageUrl" character varying,
    category character varying,
    sizes text,
    images text,
    views integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    "ordersCount" integer DEFAULT 0 NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: promotional_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotional_configs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "minTriggerSpend" numeric(10,2) DEFAULT '5000'::numeric NOT NULL,
    "rewardAmount" numeric(10,2) DEFAULT '1500'::numeric NOT NULL,
    "minRedeemOrderValue" numeric(10,2) DEFAULT '6000'::numeric NOT NULL,
    "expiryDays" integer DEFAULT 30 NOT NULL,
    "isEnabled" boolean DEFAULT true NOT NULL,
    "offerTitle" character varying DEFAULT '₹1,500 Shopping Credit on ₹5,000+ Orders'::character varying NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.returns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    "orderId" character varying NOT NULL,
    reason text NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    name character varying NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    "adminReply" text,
    "replyDate" timestamp without time zone
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: shopping_credits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopping_credits (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying NOT NULL,
    "userId" character varying,
    "userEmail" character varying,
    "userName" character varying,
    amount numeric(10,2) DEFAULT '2000'::numeric NOT NULL,
    "minOrderValue" numeric(10,2) DEFAULT '6000'::numeric NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "originOrderId" character varying,
    "usedOrderId" character varying,
    "usedAt" timestamp without time zone,
    "issuedBy" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying NOT NULL,
    "passwordHash" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    phone character varying(20)
);


--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_addresses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    "fullName" character varying NOT NULL,
    phone character varying(15) NOT NULL,
    "addressLine1" character varying NOT NULL,
    "addressLine2" character varying,
    city character varying NOT NULL,
    state character varying NOT NULL,
    pincode character varying(10) NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    "productId" integer NOT NULL,
    "productName" character varying NOT NULL,
    price numeric(10,2) NOT NULL,
    "imageUrl" character varying,
    category character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: analytics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics ALTER COLUMN id SET DEFAULT nextval('public.analytics_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Cart"  FROM stdin;
\.


--
-- Data for Name: analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analytics (id, date, hour, "pageViews", "productClicks", "ordersCount", "salesAmount") FROM stdin;
1	2026-07-01	0	7	2	0	121.00
2	2026-07-01	1	7	2	0	0.00
3	2026-07-01	2	7	2	0	0.00
4	2026-07-01	3	7	2	0	0.00
5	2026-07-01	4	7	2	0	121.00
6	2026-07-01	5	7	2	0	0.00
7	2026-07-01	6	7	2	0	0.00
8	2026-07-01	7	7	2	0	0.00
9	2026-07-01	8	7	2	0	121.00
10	2026-07-01	9	7	2	0	0.00
11	2026-07-01	10	18	6	0	0.00
12	2026-07-01	11	18	6	0	0.00
13	2026-07-01	12	18	6	0	303.00
14	2026-07-01	13	18	6	0	0.00
15	2026-07-01	14	18	6	0	0.00
16	2026-07-01	15	18	6	0	0.00
17	2026-07-01	16	18	6	0	303.00
18	2026-07-01	17	18	6	0	0.00
19	2026-07-01	18	28	10	0	0.00
20	2026-07-01	19	28	10	0	0.00
21	2026-07-01	20	28	10	0	484.00
22	2026-07-01	21	28	10	0	0.00
23	2026-07-01	22	28	10	0	0.00
24	2026-07-01	23	7	2	0	0.00
25	2026-07-02	0	10	3	0	157.00
26	2026-07-02	1	10	3	0	0.00
27	2026-07-02	2	10	3	0	0.00
28	2026-07-02	3	10	3	0	0.00
29	2026-07-02	4	10	3	0	157.00
30	2026-07-02	5	10	3	0	0.00
31	2026-07-02	6	10	3	0	0.00
32	2026-07-02	7	10	3	0	0.00
33	2026-07-02	8	10	3	0	157.00
34	2026-07-02	9	10	3	0	0.00
35	2026-07-02	10	24	8	0	0.00
36	2026-07-02	11	24	8	0	0.00
37	2026-07-02	12	24	8	0	392.00
38	2026-07-02	13	24	8	0	0.00
39	2026-07-02	14	24	8	0	0.00
40	2026-07-02	15	24	8	0	0.00
41	2026-07-02	16	24	8	0	392.00
42	2026-07-02	17	24	8	0	0.00
43	2026-07-02	18	38	13	0	0.00
44	2026-07-02	19	38	13	0	0.00
45	2026-07-02	20	38	13	1	627.00
46	2026-07-02	21	38	13	0	0.00
47	2026-07-02	22	38	13	0	0.00
48	2026-07-02	23	10	3	0	0.00
49	2026-07-03	0	12	4	0	197.00
50	2026-07-03	1	12	4	0	0.00
51	2026-07-03	2	12	4	0	0.00
52	2026-07-03	3	12	4	0	0.00
53	2026-07-03	4	12	4	0	197.00
54	2026-07-03	5	12	4	0	0.00
55	2026-07-03	6	12	4	0	0.00
56	2026-07-03	7	12	4	0	0.00
57	2026-07-03	8	12	4	0	197.00
58	2026-07-03	9	12	4	0	0.00
59	2026-07-03	10	30	11	0	0.00
60	2026-07-03	11	30	11	0	0.00
61	2026-07-03	12	30	11	0	492.00
62	2026-07-03	13	30	11	0	0.00
63	2026-07-03	14	30	11	0	0.00
64	2026-07-03	15	30	11	0	0.00
65	2026-07-03	16	30	11	0	492.00
66	2026-07-03	17	30	11	0	0.00
67	2026-07-03	18	48	17	0	0.00
68	2026-07-03	19	48	17	0	0.00
69	2026-07-03	20	48	17	1	787.00
70	2026-07-03	21	48	17	0	0.00
71	2026-07-03	22	48	17	0	0.00
72	2026-07-03	23	12	4	0	0.00
73	2026-07-04	0	15	5	0	241.00
74	2026-07-04	1	15	5	0	0.00
75	2026-07-04	2	15	5	0	0.00
76	2026-07-04	3	15	5	0	0.00
77	2026-07-04	4	15	5	0	241.00
78	2026-07-04	5	15	5	0	0.00
79	2026-07-04	6	15	5	0	0.00
80	2026-07-04	7	15	5	0	0.00
81	2026-07-04	8	15	5	0	241.00
82	2026-07-04	9	15	5	0	0.00
83	2026-07-04	10	36	13	0	0.00
84	2026-07-04	11	36	13	0	0.00
85	2026-07-04	12	36	13	0	603.00
86	2026-07-04	13	36	13	0	0.00
87	2026-07-04	14	36	13	0	0.00
88	2026-07-04	15	36	13	0	0.00
89	2026-07-04	16	36	13	0	603.00
90	2026-07-04	17	36	13	0	0.00
91	2026-07-04	18	58	20	0	0.00
92	2026-07-04	19	58	20	0	0.00
93	2026-07-04	20	58	20	1	964.00
94	2026-07-04	21	58	20	0	0.00
95	2026-07-04	22	58	20	0	0.00
96	2026-07-04	23	15	5	0	0.00
97	2026-07-05	0	17	6	0	290.00
98	2026-07-05	1	17	6	0	0.00
99	2026-07-05	2	17	6	0	0.00
100	2026-07-05	3	17	6	0	0.00
101	2026-07-05	4	17	6	0	290.00
102	2026-07-05	5	17	6	0	0.00
103	2026-07-05	6	17	6	0	0.00
104	2026-07-05	7	17	6	0	0.00
105	2026-07-05	8	17	6	0	290.00
106	2026-07-05	9	17	6	0	0.00
107	2026-07-05	10	43	15	0	0.00
108	2026-07-05	11	43	15	0	0.00
109	2026-07-05	12	43	15	1	725.00
110	2026-07-05	13	43	15	0	0.00
111	2026-07-05	14	43	15	0	0.00
112	2026-07-05	15	43	15	0	0.00
113	2026-07-05	16	43	15	1	725.00
114	2026-07-05	17	43	15	0	0.00
115	2026-07-05	18	68	24	0	0.00
116	2026-07-05	19	68	24	0	0.00
117	2026-07-05	20	68	24	1	1159.00
118	2026-07-05	21	68	24	0	0.00
119	2026-07-05	22	68	24	0	0.00
120	2026-07-05	23	17	6	0	0.00
121	2026-07-06	0	8	3	0	162.00
122	2026-07-06	1	8	3	0	0.00
123	2026-07-06	2	8	3	0	0.00
124	2026-07-06	3	8	3	0	0.00
125	2026-07-06	4	8	3	0	162.00
126	2026-07-06	5	8	3	0	0.00
127	2026-07-06	6	8	3	0	0.00
128	2026-07-06	7	8	3	0	0.00
129	2026-07-06	8	8	3	0	162.00
130	2026-07-06	9	8	3	0	0.00
131	2026-07-06	10	20	7	0	0.00
132	2026-07-06	11	20	7	0	0.00
133	2026-07-06	12	20	7	0	405.00
134	2026-07-06	13	20	7	0	0.00
135	2026-07-06	14	20	7	0	0.00
136	2026-07-06	15	20	7	0	0.00
137	2026-07-06	16	20	7	0	405.00
138	2026-07-06	17	20	7	0	0.00
139	2026-07-06	18	32	11	0	0.00
140	2026-07-06	19	32	11	0	0.00
141	2026-07-06	20	32	11	1	647.00
142	2026-07-06	21	32	11	0	0.00
143	2026-07-06	22	32	11	0	0.00
144	2026-07-06	23	8	3	0	0.00
145	2026-07-07	0	11	4	0	202.00
146	2026-07-07	1	11	4	0	0.00
147	2026-07-07	2	11	4	0	0.00
148	2026-07-07	3	11	4	0	0.00
149	2026-07-07	4	11	4	0	202.00
150	2026-07-07	5	11	4	0	0.00
151	2026-07-07	6	11	4	0	0.00
152	2026-07-07	7	11	4	0	0.00
153	2026-07-07	8	11	4	0	202.00
154	2026-07-07	9	11	4	0	0.00
155	2026-07-07	10	27	9	0	0.00
156	2026-07-07	11	27	9	0	0.00
157	2026-07-07	12	27	9	1	505.00
158	2026-07-07	13	27	9	0	0.00
159	2026-07-07	14	27	9	0	0.00
160	2026-07-07	15	27	9	0	0.00
161	2026-07-07	16	27	9	1	505.00
162	2026-07-07	17	27	9	0	0.00
163	2026-07-07	18	42	15	0	0.00
164	2026-07-07	19	42	15	0	0.00
165	2026-07-07	20	42	15	1	807.00
166	2026-07-07	21	42	15	0	0.00
167	2026-07-07	22	42	15	0	0.00
168	2026-07-07	23	11	4	0	0.00
169	2026-07-08	0	10	3	0	157.00
170	2026-07-08	1	10	3	0	0.00
171	2026-07-08	2	10	3	0	0.00
172	2026-07-08	3	10	3	0	0.00
173	2026-07-08	4	10	3	0	157.00
174	2026-07-08	5	10	3	0	0.00
175	2026-07-08	6	10	3	0	0.00
176	2026-07-08	7	10	3	0	0.00
177	2026-07-08	8	10	3	0	157.00
178	2026-07-08	9	10	3	0	0.00
179	2026-07-08	10	24	8	0	0.00
180	2026-07-08	11	24	8	0	0.00
181	2026-07-08	12	24	8	0	392.00
182	2026-07-08	13	24	8	0	0.00
183	2026-07-08	14	24	8	0	0.00
184	2026-07-08	15	24	8	0	0.00
185	2026-07-08	16	24	8	0	392.00
186	2026-07-08	17	24	8	0	0.00
187	2026-07-08	18	38	13	0	0.00
188	2026-07-08	19	38	13	0	0.00
189	2026-07-08	20	38	13	1	627.00
190	2026-07-08	21	38	13	0	0.00
191	2026-07-08	22	38	13	0	0.00
192	2026-07-08	23	10	3	0	0.00
193	2026-07-09	0	12	4	0	197.00
194	2026-07-09	1	12	4	0	0.00
195	2026-07-09	2	12	4	0	0.00
196	2026-07-09	3	12	4	0	0.00
197	2026-07-09	4	12	4	0	197.00
198	2026-07-09	5	12	4	0	0.00
199	2026-07-09	6	12	4	0	0.00
200	2026-07-09	7	12	4	0	0.00
201	2026-07-09	8	12	4	0	197.00
202	2026-07-09	9	12	4	0	0.00
203	2026-07-09	10	30	11	0	0.00
204	2026-07-09	11	30	11	0	0.00
205	2026-07-09	12	30	11	0	492.00
206	2026-07-09	13	30	11	0	0.00
207	2026-07-09	14	30	11	0	0.00
208	2026-07-09	15	30	11	0	0.00
209	2026-07-09	16	30	11	0	492.00
210	2026-07-09	17	30	11	0	0.00
211	2026-07-09	18	48	17	0	0.00
212	2026-07-09	19	48	17	0	0.00
213	2026-07-09	20	48	17	1	787.00
214	2026-07-09	21	48	17	0	0.00
215	2026-07-09	22	48	17	0	0.00
216	2026-07-09	23	12	4	0	0.00
217	2026-07-10	0	15	5	0	241.00
218	2026-07-10	1	15	5	0	0.00
219	2026-07-10	2	15	5	0	0.00
220	2026-07-10	3	15	5	0	0.00
221	2026-07-10	4	15	5	0	241.00
222	2026-07-10	5	15	5	0	0.00
223	2026-07-10	6	15	5	0	0.00
224	2026-07-10	7	15	5	0	0.00
225	2026-07-10	8	15	5	0	241.00
226	2026-07-10	9	15	5	0	0.00
227	2026-07-10	10	36	13	0	0.00
228	2026-07-10	11	36	13	0	0.00
229	2026-07-10	12	36	13	0	603.00
230	2026-07-10	13	36	13	0	0.00
231	2026-07-10	14	36	13	0	0.00
232	2026-07-10	15	36	13	0	0.00
233	2026-07-10	16	36	13	0	603.00
234	2026-07-10	17	36	13	0	0.00
235	2026-07-10	18	58	20	0	0.00
236	2026-07-10	19	58	20	0	0.00
237	2026-07-10	20	58	20	1	964.00
238	2026-07-10	21	58	20	0	0.00
239	2026-07-10	22	58	20	0	0.00
240	2026-07-10	23	15	5	0	0.00
241	2026-07-11	0	17	6	0	290.00
242	2026-07-11	1	17	6	0	0.00
243	2026-07-11	2	17	6	0	0.00
244	2026-07-11	3	17	6	0	0.00
245	2026-07-11	4	17	6	0	290.00
246	2026-07-11	5	17	6	0	0.00
247	2026-07-11	6	17	6	0	0.00
248	2026-07-11	7	17	6	0	0.00
249	2026-07-11	8	17	6	0	290.00
250	2026-07-11	9	17	6	0	0.00
251	2026-07-11	10	43	15	0	0.00
252	2026-07-11	11	43	15	0	0.00
253	2026-07-11	12	43	15	1	725.00
254	2026-07-11	13	43	15	0	0.00
255	2026-07-11	14	43	15	0	0.00
256	2026-07-11	15	43	15	0	0.00
257	2026-07-11	16	43	15	1	725.00
258	2026-07-11	17	43	15	0	0.00
259	2026-07-11	18	68	24	0	0.00
260	2026-07-11	19	68	24	0	0.00
261	2026-07-11	20	68	24	1	1159.00
262	2026-07-11	21	68	24	0	0.00
263	2026-07-11	22	68	24	0	0.00
264	2026-07-11	23	17	6	0	0.00
265	2026-07-12	0	5	2	0	90.00
266	2026-07-12	1	5	2	0	0.00
267	2026-07-12	2	5	2	0	0.00
268	2026-07-12	3	5	2	0	0.00
269	2026-07-12	4	5	2	0	90.00
270	2026-07-12	5	5	2	0	0.00
271	2026-07-12	6	5	2	0	0.00
272	2026-07-12	7	5	2	0	0.00
273	2026-07-12	8	5	2	0	90.00
274	2026-07-12	9	5	2	0	0.00
275	2026-07-12	10	11	4	0	0.00
276	2026-07-12	11	11	4	0	0.00
277	2026-07-12	12	11	4	0	225.00
278	2026-07-12	13	11	4	0	0.00
279	2026-07-12	14	11	4	0	0.00
280	2026-07-12	15	11	4	0	0.00
281	2026-07-12	16	11	4	0	225.00
282	2026-07-12	17	11	4	0	0.00
283	2026-07-12	18	18	6	0	0.00
284	2026-07-12	19	18	6	0	0.00
285	2026-07-12	20	18	6	0	360.00
286	2026-07-12	21	18	6	0	0.00
287	2026-07-12	22	18	6	0	0.00
288	2026-07-12	23	5	2	0	0.00
289	2026-07-13	0	11	4	0	202.00
290	2026-07-13	1	11	4	0	0.00
291	2026-07-13	2	11	4	0	0.00
292	2026-07-13	3	11	4	0	0.00
293	2026-07-13	4	11	4	0	202.00
294	2026-07-13	5	11	4	0	0.00
295	2026-07-13	6	11	4	0	0.00
296	2026-07-13	7	11	4	0	0.00
297	2026-07-13	8	11	4	0	202.00
298	2026-07-13	9	11	4	0	0.00
299	2026-07-13	10	27	9	0	0.00
300	2026-07-13	11	27	9	0	0.00
301	2026-07-13	12	27	9	1	505.00
302	2026-07-13	13	27	9	0	0.00
303	2026-07-13	14	27	9	0	0.00
304	2026-07-13	15	27	9	0	0.00
305	2026-07-13	16	27	9	1	505.00
306	2026-07-13	17	27	9	0	0.00
307	2026-07-13	18	42	15	0	0.00
308	2026-07-13	19	42	15	0	0.00
309	2026-07-13	20	42	15	1	807.00
310	2026-07-13	21	42	15	0	0.00
311	2026-07-13	22	42	15	0	0.00
312	2026-07-13	23	11	4	0	0.00
313	2026-07-14	0	13	5	0	246.00
314	2026-07-14	1	13	5	0	0.00
315	2026-07-14	2	13	5	0	0.00
316	2026-07-14	3	13	5	0	0.00
317	2026-07-14	4	13	5	0	246.00
318	2026-07-14	5	13	5	0	0.00
319	2026-07-14	6	13	5	0	0.00
320	2026-07-14	7	13	5	0	0.00
321	2026-07-14	8	13	5	0	246.00
322	2026-07-14	9	13	5	0	0.00
323	2026-07-14	10	33	11	0	0.00
324	2026-07-14	11	33	11	0	0.00
325	2026-07-14	12	33	11	1	615.00
326	2026-07-14	13	33	11	0	0.00
327	2026-07-14	14	33	11	0	0.00
328	2026-07-14	15	33	11	0	0.00
329	2026-07-14	16	33	11	1	615.00
330	2026-07-14	17	33	11	0	0.00
331	2026-07-14	18	52	18	0	0.00
332	2026-07-14	19	52	18	0	0.00
333	2026-07-14	20	52	18	1	985.00
334	2026-07-14	21	52	18	0	0.00
335	2026-07-14	22	52	18	0	0.00
336	2026-07-14	23	13	5	0	0.00
337	2026-07-15	0	12	4	0	197.00
338	2026-07-15	1	12	4	0	0.00
339	2026-07-15	2	12	4	0	0.00
340	2026-07-15	3	12	4	0	0.00
341	2026-07-15	4	12	4	0	197.00
342	2026-07-15	5	12	4	0	0.00
343	2026-07-15	6	12	4	0	0.00
344	2026-07-15	7	12	4	0	0.00
345	2026-07-15	8	12	4	0	197.00
346	2026-07-15	9	12	4	0	0.00
347	2026-07-15	10	30	11	0	0.00
348	2026-07-15	11	30	11	0	0.00
349	2026-07-15	12	30	11	0	492.00
350	2026-07-15	13	30	11	0	0.00
351	2026-07-15	14	30	11	0	0.00
352	2026-07-15	15	30	11	0	0.00
353	2026-07-15	16	30	11	0	492.00
354	2026-07-15	17	30	11	0	0.00
355	2026-07-15	18	48	17	0	0.00
356	2026-07-15	19	48	17	0	0.00
357	2026-07-15	20	48	17	1	787.00
358	2026-07-15	21	48	17	0	0.00
359	2026-07-15	22	48	17	0	0.00
360	2026-07-15	23	12	4	0	0.00
361	2026-07-16	0	15	5	0	241.00
362	2026-07-16	1	15	5	0	0.00
363	2026-07-16	2	15	5	0	0.00
364	2026-07-16	3	15	5	0	0.00
365	2026-07-16	4	15	5	0	241.00
366	2026-07-16	5	15	5	0	0.00
367	2026-07-16	6	15	5	0	0.00
368	2026-07-16	7	15	5	0	0.00
369	2026-07-16	8	15	5	0	241.00
370	2026-07-16	9	15	5	0	0.00
371	2026-07-16	10	36	13	0	0.00
372	2026-07-16	11	36	13	0	0.00
373	2026-07-16	12	36	13	0	603.00
374	2026-07-16	13	36	13	0	0.00
375	2026-07-16	14	36	13	0	0.00
376	2026-07-16	15	36	13	0	0.00
377	2026-07-16	16	36	13	0	603.00
378	2026-07-16	17	36	13	0	0.00
379	2026-07-16	18	58	20	0	0.00
380	2026-07-16	19	58	20	0	0.00
381	2026-07-16	20	58	20	1	964.00
382	2026-07-16	21	58	20	0	0.00
383	2026-07-16	22	58	20	0	0.00
384	2026-07-16	23	15	5	0	0.00
385	2026-07-17	0	17	6	0	290.00
386	2026-07-17	1	17	6	0	0.00
387	2026-07-17	2	17	6	0	0.00
388	2026-07-17	3	17	6	0	0.00
389	2026-07-17	4	17	6	0	290.00
390	2026-07-17	5	17	6	0	0.00
391	2026-07-17	6	17	6	0	0.00
392	2026-07-17	7	17	6	0	0.00
393	2026-07-17	8	17	6	0	290.00
394	2026-07-17	9	17	6	0	0.00
395	2026-07-17	10	43	15	0	0.00
396	2026-07-17	11	43	15	0	0.00
397	2026-07-17	12	43	15	1	725.00
398	2026-07-17	13	43	15	0	0.00
399	2026-07-17	14	43	15	0	0.00
400	2026-07-17	15	43	15	0	0.00
401	2026-07-17	16	43	15	1	725.00
402	2026-07-17	17	43	15	0	0.00
403	2026-07-17	18	68	24	0	0.00
404	2026-07-17	19	68	24	0	0.00
405	2026-07-17	20	68	24	1	1159.00
406	2026-07-17	21	68	24	0	0.00
407	2026-07-17	22	68	24	0	0.00
408	2026-07-17	23	17	6	0	0.00
409	2026-07-18	0	5	2	0	90.00
410	2026-07-18	1	5	2	0	0.00
411	2026-07-18	2	5	2	0	0.00
412	2026-07-18	3	5	2	0	0.00
413	2026-07-18	4	5	2	0	90.00
414	2026-07-18	5	5	2	0	0.00
415	2026-07-18	6	5	2	0	0.00
416	2026-07-18	7	5	2	0	0.00
417	2026-07-18	8	5	2	0	90.00
418	2026-07-18	9	5	2	0	0.00
419	2026-07-18	10	11	4	0	0.00
420	2026-07-18	11	11	4	0	0.00
421	2026-07-18	12	11	4	0	225.00
422	2026-07-18	13	11	4	0	0.00
423	2026-07-18	14	11	4	0	0.00
424	2026-07-18	15	11	4	0	0.00
425	2026-07-18	16	11	4	0	225.00
426	2026-07-18	17	11	4	0	0.00
427	2026-07-18	18	18	6	0	0.00
428	2026-07-18	19	18	6	0	0.00
429	2026-07-18	20	18	6	0	360.00
430	2026-07-18	21	18	6	0	0.00
431	2026-07-18	22	18	6	0	0.00
432	2026-07-18	23	5	2	0	0.00
433	2026-07-19	0	7	2	0	121.00
434	2026-07-19	1	7	2	0	0.00
435	2026-07-19	2	7	2	0	0.00
436	2026-07-19	3	7	2	0	0.00
437	2026-07-19	4	7	2	0	121.00
438	2026-07-19	5	7	2	0	0.00
439	2026-07-19	6	7	2	0	0.00
440	2026-07-19	7	7	2	0	0.00
441	2026-07-19	8	7	2	0	121.00
442	2026-07-19	9	7	2	0	0.00
443	2026-07-19	10	18	6	0	0.00
444	2026-07-19	11	18	6	0	0.00
445	2026-07-19	12	18	6	0	303.00
446	2026-07-19	13	18	6	0	0.00
447	2026-07-19	14	18	6	0	0.00
448	2026-07-19	15	18	6	0	0.00
449	2026-07-19	16	18	6	0	303.00
450	2026-07-19	17	18	6	0	0.00
451	2026-07-19	18	28	10	0	0.00
452	2026-07-19	19	28	10	0	0.00
453	2026-07-19	20	28	10	0	484.00
454	2026-07-19	21	28	10	0	0.00
455	2026-07-19	22	28	10	0	0.00
456	2026-07-19	23	7	2	0	0.00
457	2026-07-20	0	13	5	0	246.00
458	2026-07-20	1	13	5	0	0.00
459	2026-07-20	2	13	5	0	0.00
460	2026-07-20	3	13	5	0	0.00
461	2026-07-20	4	13	5	0	246.00
462	2026-07-20	5	13	5	0	0.00
463	2026-07-20	6	13	5	0	0.00
464	2026-07-20	7	13	5	0	0.00
465	2026-07-20	8	13	5	0	246.00
466	2026-07-20	9	13	5	0	0.00
467	2026-07-20	10	33	11	0	0.00
468	2026-07-20	11	33	11	0	0.00
469	2026-07-20	12	33	11	1	615.00
470	2026-07-20	13	33	11	0	0.00
471	2026-07-20	14	33	11	0	0.00
472	2026-07-20	15	33	11	0	0.00
473	2026-07-20	16	33	11	1	615.00
474	2026-07-20	17	33	11	0	0.00
475	2026-07-20	18	52	18	0	0.00
476	2026-07-20	19	52	18	0	0.00
477	2026-07-20	20	52	18	1	985.00
478	2026-07-20	21	52	18	0	0.00
479	2026-07-20	22	52	18	0	0.00
480	2026-07-20	23	13	5	0	0.00
481	2026-07-21	0	16	5	0	295.00
482	2026-07-21	1	16	5	0	0.00
483	2026-07-21	2	16	5	0	0.00
484	2026-07-21	3	16	5	0	0.00
485	2026-07-21	4	16	5	0	295.00
486	2026-07-21	5	16	5	0	0.00
487	2026-07-21	6	16	5	0	0.00
488	2026-07-21	7	16	5	0	0.00
489	2026-07-21	8	16	5	0	295.00
490	2026-07-21	9	16	5	0	0.00
491	2026-07-21	10	39	14	0	0.00
492	2026-07-21	11	39	14	0	0.00
493	2026-07-21	12	39	14	1	737.00
494	2026-07-21	13	39	14	0	0.00
495	2026-07-21	14	39	14	0	0.00
496	2026-07-21	15	39	14	0	0.00
497	2026-07-21	16	39	14	1	737.00
498	2026-07-21	17	39	14	0	0.00
499	2026-07-21	18	62	22	0	0.00
500	2026-07-21	19	62	22	0	0.00
501	2026-07-21	20	62	22	1	1180.00
502	2026-07-21	21	62	22	0	0.00
503	2026-07-21	22	62	22	0	0.00
504	2026-07-21	23	16	5	0	0.00
505	2026-07-22	0	15	5	0	241.00
506	2026-07-22	1	15	5	0	0.00
507	2026-07-22	2	15	5	0	0.00
508	2026-07-22	3	15	5	0	0.00
509	2026-07-22	4	15	5	0	241.00
510	2026-07-22	5	15	5	0	0.00
511	2026-07-22	6	15	5	0	0.00
512	2026-07-22	7	15	5	0	0.00
513	2026-07-22	8	15	5	0	241.00
514	2026-07-22	9	15	5	0	0.00
515	2026-07-22	10	36	13	0	0.00
516	2026-07-22	11	36	13	0	0.00
517	2026-07-22	12	36	13	0	603.00
518	2026-07-22	13	36	13	0	0.00
519	2026-07-22	14	36	13	0	0.00
520	2026-07-22	15	36	13	0	0.00
521	2026-07-22	16	36	13	0	603.00
522	2026-07-22	17	36	13	0	0.00
523	2026-07-22	18	58	20	0	0.00
524	2026-07-22	19	58	20	0	0.00
525	2026-07-22	20	58	20	1	964.00
526	2026-07-22	21	58	20	0	0.00
527	2026-07-22	22	58	20	0	0.00
528	2026-07-22	23	15	5	0	0.00
529	2026-07-23	0	17	6	0	290.00
530	2026-07-23	1	17	6	0	0.00
531	2026-07-23	2	17	6	0	0.00
532	2026-07-23	3	17	6	0	0.00
533	2026-07-23	4	17	6	0	290.00
534	2026-07-23	5	17	6	0	0.00
535	2026-07-23	6	17	6	0	0.00
536	2026-07-23	7	17	6	0	0.00
537	2026-07-23	8	17	6	0	290.00
538	2026-07-23	9	17	6	0	0.00
539	2026-07-23	10	43	15	0	0.00
540	2026-07-23	11	43	15	0	0.00
541	2026-07-23	12	43	15	1	725.00
542	2026-07-23	13	43	15	0	0.00
543	2026-07-23	14	43	15	0	0.00
544	2026-07-23	15	43	15	0	0.00
545	2026-07-23	16	43	15	1	725.00
546	2026-07-23	17	43	15	0	0.00
547	2026-07-23	18	68	24	0	0.00
548	2026-07-23	19	68	24	0	0.00
549	2026-07-23	20	68	24	1	1159.00
550	2026-07-23	21	68	24	0	0.00
551	2026-07-23	22	68	24	0	0.00
552	2026-07-23	23	17	6	0	0.00
553	2026-07-24	0	5	2	0	90.00
554	2026-07-24	1	5	2	0	0.00
555	2026-07-24	2	5	2	0	0.00
556	2026-07-24	3	5	2	0	0.00
557	2026-07-24	4	5	2	0	90.00
558	2026-07-24	5	5	2	0	0.00
559	2026-07-24	6	5	2	0	0.00
560	2026-07-24	7	5	2	0	0.00
561	2026-07-24	8	5	2	0	90.00
562	2026-07-24	9	5	2	0	0.00
563	2026-07-24	10	11	4	0	0.00
564	2026-07-24	11	11	4	0	0.00
565	2026-07-24	12	11	4	0	225.00
566	2026-07-24	13	11	4	0	0.00
567	2026-07-24	14	11	4	0	0.00
568	2026-07-24	15	11	4	0	0.00
569	2026-07-24	16	11	4	0	225.00
570	2026-07-24	17	11	4	0	0.00
572	2026-07-24	19	18	6	0	0.00
573	2026-07-24	20	18	6	0	360.00
576	2026-07-24	23	5	2	0	0.00
577	2026-07-25	0	7	2	0	121.00
578	2026-07-25	1	7	2	0	0.00
579	2026-07-25	2	7	2	0	0.00
580	2026-07-25	3	7	2	0	0.00
581	2026-07-25	4	7	2	0	121.00
582	2026-07-25	5	7	2	0	0.00
583	2026-07-25	6	7	2	0	0.00
584	2026-07-25	7	7	2	0	0.00
585	2026-07-25	8	7	2	0	121.00
586	2026-07-25	9	7	2	0	0.00
587	2026-07-25	10	18	6	0	0.00
588	2026-07-25	11	18	6	0	0.00
589	2026-07-25	12	18	6	0	303.00
590	2026-07-25	13	18	6	0	0.00
591	2026-07-25	14	18	6	0	0.00
592	2026-07-25	15	18	6	0	0.00
593	2026-07-25	16	18	6	0	303.00
594	2026-07-25	17	18	6	0	0.00
595	2026-07-25	18	28	10	0	0.00
596	2026-07-25	19	28	10	0	0.00
597	2026-07-25	20	28	10	0	484.00
598	2026-07-25	21	28	10	0	0.00
599	2026-07-25	22	28	10	0	0.00
600	2026-07-25	23	7	2	0	0.00
574	2026-07-24	21	18	8	0	0.00
601	2026-07-26	0	10	3	0	157.00
602	2026-07-26	1	10	3	0	0.00
603	2026-07-26	2	10	3	0	0.00
604	2026-07-26	3	10	3	0	0.00
605	2026-07-26	4	10	3	0	157.00
606	2026-07-26	5	10	3	0	0.00
607	2026-07-26	6	10	3	0	0.00
608	2026-07-26	7	10	3	0	0.00
609	2026-07-26	8	10	3	0	157.00
610	2026-07-26	9	10	3	0	0.00
611	2026-07-26	10	24	8	0	0.00
612	2026-07-26	11	24	8	0	0.00
613	2026-07-26	12	24	8	0	392.00
614	2026-07-26	13	24	8	0	0.00
615	2026-07-26	14	24	8	0	0.00
616	2026-07-26	15	24	8	0	0.00
617	2026-07-26	16	24	8	0	392.00
618	2026-07-26	17	24	8	0	0.00
619	2026-07-26	18	38	13	0	0.00
620	2026-07-26	19	38	13	0	0.00
621	2026-07-26	20	38	13	1	627.00
622	2026-07-26	21	38	13	0	0.00
623	2026-07-26	22	38	13	0	0.00
624	2026-07-26	23	10	3	0	0.00
625	2026-07-27	0	16	5	0	295.00
626	2026-07-27	1	16	5	0	0.00
627	2026-07-27	2	16	5	0	0.00
628	2026-07-27	3	16	5	0	0.00
629	2026-07-27	4	16	5	0	295.00
630	2026-07-27	5	16	5	0	0.00
631	2026-07-27	6	16	5	0	0.00
632	2026-07-27	7	16	5	0	0.00
633	2026-07-27	8	16	5	0	295.00
634	2026-07-27	9	16	5	0	0.00
635	2026-07-27	10	39	14	0	0.00
636	2026-07-27	11	39	14	0	0.00
637	2026-07-27	12	39	14	1	737.00
638	2026-07-27	13	39	14	0	0.00
639	2026-07-27	14	39	14	0	0.00
640	2026-07-27	15	39	14	0	0.00
641	2026-07-27	16	39	14	1	737.00
642	2026-07-27	17	39	14	0	0.00
643	2026-07-27	18	62	22	0	0.00
644	2026-07-27	19	62	22	0	0.00
645	2026-07-27	20	62	22	1	1180.00
646	2026-07-27	21	62	22	0	0.00
647	2026-07-27	22	62	22	0	0.00
648	2026-07-27	23	16	5	0	0.00
649	2026-07-28	0	18	6	0	348.00
650	2026-07-28	1	18	6	0	0.00
651	2026-07-28	2	18	6	0	0.00
652	2026-07-28	3	18	6	0	0.00
653	2026-07-28	4	18	6	0	348.00
654	2026-07-28	5	18	6	0	0.00
655	2026-07-28	6	18	6	0	0.00
656	2026-07-28	7	18	6	0	0.00
657	2026-07-28	8	18	6	0	348.00
658	2026-07-28	9	18	6	0	0.00
659	2026-07-28	10	45	16	0	0.00
660	2026-07-28	11	45	16	0	0.00
661	2026-07-28	12	45	16	1	870.00
662	2026-07-28	13	45	16	0	0.00
663	2026-07-28	14	45	16	0	0.00
664	2026-07-28	15	45	16	0	0.00
665	2026-07-28	16	45	16	1	870.00
666	2026-07-28	17	45	16	0	0.00
667	2026-07-28	18	72	25	0	0.00
668	2026-07-28	19	72	25	0	0.00
669	2026-07-28	20	72	25	1	1393.00
670	2026-07-28	21	72	25	0	0.00
671	2026-07-28	22	72	25	0	0.00
672	2026-07-28	23	18	6	0	0.00
673	2026-07-29	0	17	6	0	290.00
674	2026-07-29	1	17	6	0	0.00
675	2026-07-29	2	17	6	0	0.00
676	2026-07-29	3	17	6	0	0.00
677	2026-07-29	4	17	6	0	290.00
678	2026-07-29	5	17	6	0	0.00
679	2026-07-29	6	17	6	0	0.00
680	2026-07-29	7	17	6	0	0.00
681	2026-07-29	8	17	6	0	290.00
682	2026-07-29	9	17	6	0	0.00
683	2026-07-29	10	43	15	0	0.00
684	2026-07-29	11	43	15	0	0.00
685	2026-07-29	12	43	15	1	725.00
686	2026-07-29	13	43	15	0	0.00
687	2026-07-29	14	43	15	0	0.00
688	2026-07-29	15	43	15	0	0.00
689	2026-07-29	16	43	15	1	725.00
690	2026-07-29	17	43	15	0	0.00
691	2026-07-29	18	68	24	0	0.00
692	2026-07-29	19	68	24	0	0.00
693	2026-07-29	20	68	24	1	1159.00
694	2026-07-29	21	68	24	0	0.00
695	2026-07-29	22	68	24	0	0.00
696	2026-07-29	23	17	6	0	0.00
697	2026-07-30	0	5	2	0	90.00
698	2026-07-30	1	5	2	0	0.00
699	2026-07-30	2	5	2	0	0.00
700	2026-07-30	3	5	2	0	0.00
701	2026-07-30	4	5	2	0	90.00
702	2026-07-30	5	5	2	0	0.00
703	2026-07-30	6	5	2	0	0.00
704	2026-07-30	7	5	2	0	0.00
705	2026-07-30	8	5	2	0	90.00
706	2026-07-30	9	5	2	0	0.00
707	2026-07-30	10	11	4	0	0.00
708	2026-07-30	11	11	4	0	0.00
709	2026-07-30	12	11	4	0	225.00
710	2026-07-30	13	11	4	0	0.00
711	2026-07-30	14	11	4	0	0.00
712	2026-07-30	15	11	4	0	0.00
713	2026-07-30	16	11	4	0	225.00
714	2026-07-30	17	11	4	0	0.00
715	2026-07-30	18	18	6	0	0.00
716	2026-07-30	19	18	6	0	0.00
717	2026-07-30	20	18	6	0	360.00
718	2026-07-30	21	18	6	0	0.00
719	2026-07-30	22	18	6	0	0.00
720	2026-07-30	23	5	2	0	0.00
721	2026-07-31	0	7	2	0	121.00
722	2026-07-31	1	7	2	0	0.00
723	2026-07-31	2	7	2	0	0.00
724	2026-07-31	3	7	2	0	0.00
725	2026-07-31	4	7	2	0	121.00
726	2026-07-31	5	7	2	0	0.00
727	2026-07-31	6	7	2	0	0.00
728	2026-07-31	7	7	2	0	0.00
729	2026-07-31	8	7	2	0	121.00
730	2026-07-31	9	7	2	0	0.00
731	2026-07-31	10	18	6	0	0.00
732	2026-07-31	11	18	6	0	0.00
733	2026-07-31	12	18	6	0	303.00
734	2026-07-31	13	18	6	0	0.00
735	2026-07-31	14	18	6	0	0.00
736	2026-07-31	15	18	6	0	0.00
737	2026-07-31	16	18	6	0	303.00
738	2026-07-31	17	18	6	0	0.00
739	2026-07-31	18	28	10	0	0.00
740	2026-07-31	19	28	10	0	0.00
741	2026-07-31	20	28	10	0	484.00
742	2026-07-31	21	28	10	0	0.00
743	2026-07-31	22	28	10	0	0.00
744	2026-07-31	23	7	2	0	0.00
571	2026-07-24	18	18	11	0	0.00
575	2026-07-24	22	18	8	0	0.00
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carts (id, "productName", price, quantity, size, category, "createdAt", "updatedAt", "productId", "imageUrl") FROM stdin;
dfaa1192-e738-45ef-92f6-ff4e7a84a3e3	cotton	320.00	1	\N	plan	2026-07-24 15:05:44.919428	2026-07-24 15:05:44.919428	19	https://res.cloudinary.com/dj1cxqgre/image/upload/v1782032248/menswear-products/file_lsfw6g.jpg
fb54068e-6014-4319-971a-0843809c4af2	cotton	320.00	1	M	plan	2026-07-24 15:05:54.471234	2026-07-24 15:05:59.051084	19	https://res.cloudinary.com/dj1cxqgre/image/upload/v1782032248/menswear-products/file_lsfw6g.jpg
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, "userId", items, "totalAmount", status, "shippingAddress", "createdAt", "updatedAt", "orderNumber", "orderId") FROM stdin;
dc48c038-f686-4a47-a4f1-1c58a15da392	\N	[{"size": "M", "price": 1225, "quantity": 2, "productId": 2, "productName": "Premium Cotton Slim Formal Shirt"}]	2450.00	cancelled	{"city": "Ahmedabad", "phone": "9825012345", "pincode": "380009", "fullName": "Amit Sharma", "addressLine1": "12, CG Road, Navrangpura"}	2026-07-22 18:14:50.894	2026-07-24 18:16:00.697711	1002	AVR-1002
00613974-96b7-4588-9309-edc201dfb010	\N	[{"size": "XL", "price": 1450, "quantity": 1, "productId": 3, "productName": "Classic Checkered Casual Shirt"}]	1450.00	cancelled	{"city": "Vadodara", "phone": "9909988776", "pincode": "390007", "fullName": "Jayesh Shah", "addressLine1": "88, Alkapuri"}	2026-07-24 06:14:50.894	2026-07-24 18:16:03.248152	1003	AVR-1003
b5cfb546-da50-428e-980b-c5f37752b39a	\N	[{"size": "XL", "price": 1899, "quantity": 1, "productId": 1, "productName": "Royal Silk Embroidered Kurta Set"}]	1899.00	cancelled	{"city": "Surat", "phone": "9988776655", "pincode": "395006", "fullName": "Hardik Patel", "addressLine1": "Varachha Road"}	2026-07-24 18:15:29.558739	2026-07-24 18:16:05.045661	1004	AVR-1004
71e257db-e316-4f29-b818-d08255be17ed	fd8551c9-bf9f-4d30-9acc-66331d77b237	[{"size": "s", "price": 3443, "imageUrl": "https://res.cloudinary.com/dj1cxqgre/image/upload/v1783838341/menswear-products/file_my03s3.jpg", "quantity": 1, "productId": 33, "productName": "mens wear"}]	3615.15	pending	{"city": "surat", "note": "", "phone": "+917567176085", "pincode": "394101", "fullName": "jemin rupareliya", "addressLine1": "256  jayraj sociysuafh"}	2026-07-24 18:46:54.612499	2026-07-24 18:46:54.612499	1007	AVR-1007
141ec2bc-2db0-4de0-a0da-f585ef70eea0	\N	[{"size": "s", "price": 450, "imageUrl": "https://res.cloudinary.com/dj1cxqgre/image/upload/v1782032878/menswear-products/file_mophqu.jpg", "quantity": 1, "productId": 20, "productName": "plan shirt"}]	472.50	confirmed	{"city": "surat", "note": "", "phone": "+917567176085", "pincode": "394101", "fullName": "jemin rupareliya", "addressLine1": "803 "}	2026-07-24 18:16:46.255467	2026-07-24 18:18:49.206958	1005	AVR-1005
e93bf2c1-edcb-45f8-8f71-0601a8768a90	fd8551c9-bf9f-4d30-9acc-66331d77b237	[{"size": "s", "price": 3443, "imageUrl": "https://res.cloudinary.com/dj1cxqgre/image/upload/v1784895111/menswear-products/file_wmtnil.jpg", "quantity": 1, "productId": 31, "productName": "mens wear"}]	3615.15	pending	{"city": "surat", "note": "", "phone": "+917567176085", "pincode": "394101", "fullName": "jemin rupareliya", "addressLine1": "fgfgfgf"}	2026-07-24 21:59:54.207216	2026-07-24 22:00:42.576227	1008	AVR-1008
29c0b82b-2525-4981-914b-d70da599862e	fd8551c9-bf9f-4d30-9acc-66331d77b237	[{"size": "  m ", "price": 222, "imageUrl": "https://res.cloudinary.com/dj1cxqgre/image/upload/v1784895108/menswear-products/file_gamhyh.webp", "quantity": 1, "productId": 30, "productName": "mens wear"}]	233.10	delivered	{"city": "surat", "note": "", "phone": "+917567176085", "pincode": "394101", "fullName": "mansi rupareliya", "addressLine1": "ambika nagar, mota varcha ,surat"}	2026-07-24 18:20:22.363358	2026-07-24 18:21:04.287317	1006	AVR-1006
8f9bb679-204b-40ca-8008-6608d81654fa	\N	[{"size": "L", "price": 1899, "quantity": 1, "productId": 1, "productName": "Royal Silk Embroidered Kurta Set"}]	1899.00	cancelled	{"city": "Surat", "note": "Deliver before 6 PM", "phone": "9876543210", "pincode": "395007", "fullName": "Rajesh Patel", "addressLine1": "45, Satellite Society, Ring Road"}	2026-07-21 18:14:50.894	2026-07-24 18:44:04.936092	1001	AVR-1001
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, mrp, discount, price, "imageUrl", category, sizes, images, views, clicks, "ordersCount") FROM stdin;
33	mens wear	rtrtgr	435.00	34.00	3443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1783838341/menswear-products/file_my03s3.jpg	plan	s, m , xl , l 	\N	563	182	14
34	mens wear	rtrtgr	435.00	34.00	3443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1783838344/menswear-products/file_vnp2d3.jpg	plan	s, m , xl , l 	\N	1227	393	31
35	mens wear	rtrtgr	435.00	34.00	3443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1783838345/menswear-products/file_rzpttn.jpg	plan	s, m , xl , l 	\N	1893	606	48
36	mens wear	rtrtgr	435.00	34.00	3443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1783838361/menswear-products/file_rtazl6.jpg	plan	s, m , xl , l 	\N	2559	819	66
38	mens wear	rtrtgr	435.00	34.00	3443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1783838364/menswear-products/file_iwkhri.jpg	plan	s, m , xl , l 	\N	1272	407	33
39	mens wear	rtrtgr	435.00	34.00	3443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1783838364/menswear-products/file_woujfx.jpg	plan	s, m , xl , l 	\N	1938	620	50
17	rf	DETAILS  • Premium heavyweight cotton fabric 240 GSM Double bio washed • Modern oversized fit  • High-definition typography print • Bold statement graphic design • Soft, breathable and structured feel • Unisex design	55.00	45.00	54.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1784895095/menswear-products/file_yocnqa.jpg	checks	s,   m ,   xl ,   l 	\N	819	262	21
40	mens wear	rtrtgr	3433.00	23.00	23232.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1783840532/menswear-products/file_qtsful.jpg	plan	s, m , xl , l 	\N	2604	833	67
31	mens wear	rtrtgr	435.00	34.00	3443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1784895111/menswear-products/file_wmtnil.jpg	plan	s,  m ,  xl ,  l 	\N	538	175	14
19	cotton	cotton	350.00	10.00	320.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1782032248/menswear-products/file_lsfw6g.jpg	plan	\N	\N	2589	828	66
32	mens wear	rtrtgr	435.00	34.00	3443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1784895117/menswear-products/file_ay48i8.jpg	plan	s,  m ,  xl ,  l 	\N	1419	454	36
21	fancy 	sdscds	445.00	5.00	232.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1782041717/menswear-products/file_fbhlms.jpg	checks	s, m , xl , l 	\N	1521	487	39
26	simple	dcdcddc	555.00	11.00	444.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1782045297/menswear-products/file_urkgmb.jpg	plan	s, m , xl , l 	\N	1575	504	40
29	premium shirt 	premiumn lilen cotton shirt 	700.00	10.00	550.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1782750807/menswear-products/file_e9pmpv.jpg	plan	s, m , xl , l 	\N	954	305	24
42	mens wear	rtrtgr	56.00	565.00	655.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1783843640/menswear-products/file_iemlfh.jpg	office	s,  m ,  xl ,  l 	\N	1317	421	34
41	mens wear	rtrtgr	454.00	455.00	455.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1783843430/menswear-products/file_njzpdf.jpg	checks	s,   m ,   xl ,   l 	\N	1089	348	28
18	sdf	fdd	43.00	443.00	443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1784894963/menswear-products/file_ss4jgr.webp	plan	\N	\N	627	201	16
28	mens wear	fdgfgfg	500.00	23.00	450.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1782663804/menswear-products/file_erdsvw.jpg	office	s,     m ,     xl ,     l 	\N	2688	860	69
20	plan shirt	plan shirt	500.00	10.00	450.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1782032878/menswear-products/file_mophqu.jpg	plan	s, m , xl , l 	\N	2599	832	66
30	mens wear	sdcscdscd	600.00	5.00	222.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1784895108/menswear-products/file_gamhyh.webp	office	s,  m ,  xl ,  l 	\N	2051	658	52
\.


--
-- Data for Name: promotional_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotional_configs (id, "minTriggerSpend", "rewardAmount", "minRedeemOrderValue", "expiryDays", "isEnabled", "offerTitle", "updatedAt") FROM stdin;
3b781fa8-6896-4e2e-a507-91d79ead8ef8	5000.00	1500.00	6000.00	30	t	₹1,500 Shopping Credit on ₹5,000+ Orders	2026-07-24 20:06:59.011707
\.


--
-- Data for Name: returns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.returns (id, "userId", "orderId", reason, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, "productId", name, rating, comment, date, "adminReply", "replyDate") FROM stdin;
1	28	test mansi 	5	test review this is awsomw product	2026-06-28 21:42:56.533	\N	\N
2	21	mansi 	5	this shirt is good	2026-06-28 22:00:45.056	\N	\N
3	21	jemin 	5	this shirt is buy from jemin 	2026-06-28 22:01:11.711	\N	\N
4	19	mansi 	5	hello  kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk shhhhhhhhhhh uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu ffffffffffffffffffffffffffffffffffffffffff vvvvvvvvvvvvvvvvvvvvvvvvvvv xxxxxxxxxxxxxxxxxxxxxxxxxxx ssssssssssssssssss eeeeeee	2026-06-29 21:57:09.289	\N	\N
6	20	jemin	4	nice fabric\n	2026-07-24 17:37:24.583	\N	\N
5	19	jemin 	5	i like this shirt shirt is so much amazing i woukd like to say to peolple for the buy this beautiful shirts	2026-06-29 21:59:09.111	vhghg	2026-07-24 22:06:50.416
\.


--
-- Data for Name: shopping_credits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shopping_credits (id, code, "userId", "userEmail", "userName", amount, "minOrderValue", status, "expiresAt", "originOrderId", "usedOrderId", "usedAt", "issuedBy", "createdAt", "updatedAt") FROM stdin;
3408fa7d-1acf-49d0-816b-611ee95cd6b0	SC-891204	sample-user-1	rajesh.patel@example.com	Rajesh Patel	2000.00	6000.00	active	2026-08-23 18:43:47.005	AVR-1001	\N	\N	system	2026-07-22 18:43:47.005	2026-07-24 18:43:47.013362
b255198f-e614-454e-a2c8-e71ea4dfcb51	SC-742910	sample-user-2	amit.sharma@example.com	Amit Sharma	2000.00	6000.00	used	2026-08-23 18:43:47.005	AVR-1002	AVR-1004	2026-07-23 18:43:47.005	system	2026-07-14 18:43:47.005	2026-07-24 18:43:47.064692
00f1b4e5-7e12-444a-ad01-89ff9512604e	SC-512039	\N	priya.v@example.com	Priya Verma	2000.00	6000.00	expired	2026-07-19 18:43:47.005	AVR-0988	\N	\N	system	2026-06-18 18:43:47.005	2026-07-24 18:43:47.075101
3454906c-f46e-466f-9332-5f84dbe631d1	SC-991283	\N	karan.m@example.com	Karan Mehta	2000.00	6000.00	active	2026-08-23 18:43:47.005	\N	\N	\N	admin	2026-07-23 18:43:47.005	2026-07-24 18:43:47.081133
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."user" (id, name, email, "passwordHash", "createdAt", phone) FROM stdin;
03c9c166-af8f-443b-9e29-de70dd4c38da	Mansi Rupareliya	mansirupareliya09@gmail.com	$2b$10$i6iif1BnZRDlDt0MJKKxQ.gLe.QW.1sYsZWye8bVJkw62A3fQc9T6	2026-07-12 17:50:48.598202	\N
4a80e5b6-ab55-4c60-8d50-342c3f9170bd	mansi 	mansirupareliya08@gmail.com	$2b$10$9HjXbTh64QOHWl.vSZZZn.OWsfVA3Ef9z6aYGogcXoTkkwkmoMFlW	2026-07-19 10:56:05.668021	\N
fd8551c9-bf9f-4d30-9acc-66331d77b237	Work	jeminwork8@gmail.com	$2b$10$r6j8aK4LpcQFhURhlFbOzeVzIHLL7rI8WPeFbpAB7TpL9.tcdCtTu	2026-07-24 14:57:50.07791	
\.


--
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_addresses (id, "userId", "fullName", phone, "addressLine1", "addressLine2", city, state, pincode, "isDefault", "createdAt") FROM stdin;
32d44d12-7827-4c10-9d16-d27ebd418a4d	4a80e5b6-ab55-4c60-8d50-342c3f9170bd	ds		ddddddd	dddddddede	ddde	edede	3434	t	2026-07-19 11:13:06.258134
bda502e0-76ea-4814-84cf-931a93323c61	fd8551c9-bf9f-4d30-9acc-66331d77b237	jemin rupareliya	07567176085	mota varachha		surat	Gujarat	394101	f	2026-07-24 15:04:04.005657
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlists (id, "userId", "productId", "productName", price, "imageUrl", category, "createdAt") FROM stdin;
31e55358-ea38-4076-b665-b9d6d0e9a431	fd8551c9-bf9f-4d30-9acc-66331d77b237	32	mens wear	3443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1783838340/menswear-products/file_fiuvbj.jpg	plan	2026-07-24 16:44:02.803287
2bcd869f-b66d-40b8-b9bb-1ff0b9b142a2	fd8551c9-bf9f-4d30-9acc-66331d77b237	19	cotton	320.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1782032248/menswear-products/file_lsfw6g.jpg	plan	2026-07-24 17:21:48.201177
03521e24-a146-42b3-8269-6ad5972c87e1	fd8551c9-bf9f-4d30-9acc-66331d77b237	20	plan shirt	450.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1782032878/menswear-products/file_mophqu.jpg	plan	2026-07-24 17:29:40.054204
fa20a44a-a017-4a20-8fc8-14600dacae2c	fd8551c9-bf9f-4d30-9acc-66331d77b237	30	mens wear	222.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1784895108/menswear-products/file_gamhyh.webp	office	2026-07-24 18:00:05.886237
105f874d-23b8-4204-9848-5afa76c0eadf	fd8551c9-bf9f-4d30-9acc-66331d77b237	18	sdf	443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1784894963/menswear-products/file_ss4jgr.webp	plan	2026-07-24 19:46:17.460413
37ecfc34-9340-462e-a925-c1b1948acf00	fd8551c9-bf9f-4d30-9acc-66331d77b237	31	mens wear	3443.00	https://res.cloudinary.com/dj1cxqgre/image/upload/v1784895111/menswear-products/file_wmtnil.jpg	plan	2026-07-24 21:58:48.078706
\.


--
-- Name: analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.analytics_id_seq', 744, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 42, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 6, true);


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: reviews PK_231ae565c273ee700b283f15c1d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY (id);


--
-- Name: returns PK_27a2f1895a71519ebfec7850361; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT "PK_27a2f1895a71519ebfec7850361" PRIMARY KEY (id);


--
-- Name: analytics PK_3c96dcbf1e4c57ea9e0c3144bff; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT "PK_3c96dcbf1e4c57ea9e0c3144bff" PRIMARY KEY (id);


--
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- Name: promotional_configs PK_7efbe39878cf17bd19053762640; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotional_configs
    ADD CONSTRAINT "PK_7efbe39878cf17bd19053762640" PRIMARY KEY (id);


--
-- Name: user_addresses PK_8abbeb5e3239ff7877088ffc25b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT "PK_8abbeb5e3239ff7877088ffc25b" PRIMARY KEY (id);


--
-- Name: carts PK_b5f695a59f5ebb50af3c8160816; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: wishlists PK_d0a37f2848c5d268d315325f359; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "PK_d0a37f2848c5d268d315325f359" PRIMARY KEY (id);


--
-- Name: shopping_credits PK_e7d7539755e14cd5ec2f1250c0e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_credits
    ADD CONSTRAINT "PK_e7d7539755e14cd5ec2f1250c0e" PRIMARY KEY (id);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: shopping_credits UQ_e3d43f022c1a86904af237b19fb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_credits
    ADD CONSTRAINT "UQ_e3d43f022c1a86904af237b19fb" UNIQUE (code);


--
-- Name: reviews FK_a6b3c434392f5d10ec171043666; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict bK2SQ1Tbhyf8xW82yG316QR7pydNPb5s02jFMSBRUjIXQ3fjq3KX9JjhaWA2hck

