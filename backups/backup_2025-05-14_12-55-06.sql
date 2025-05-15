--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-0+deb12u2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: greenworkAdmin
--

CREATE TABLE public.admins (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.admins OWNER TO "greenworkAdmin";

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: greenworkAdmin
--

CREATE SEQUENCE public.admins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admins_id_seq OWNER TO "greenworkAdmin";

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greenworkAdmin
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: audits; Type: TABLE; Schema: public; Owner: greenworkAdmin
--

CREATE TABLE public.audits (
    id bigint NOT NULL,
    admin_id bigint NOT NULL,
    action character varying(255) NOT NULL,
    table_name character varying(255) NOT NULL,
    record_id bigint,
    old_values text,
    new_values text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.audits OWNER TO "greenworkAdmin";

--
-- Name: audits_id_seq; Type: SEQUENCE; Schema: public; Owner: greenworkAdmin
--

CREATE SEQUENCE public.audits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audits_id_seq OWNER TO "greenworkAdmin";

--
-- Name: audits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greenworkAdmin
--

ALTER SEQUENCE public.audits_id_seq OWNED BY public.audits.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: greenworkAdmin
--

CREATE TABLE public.contacts (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    "termsAndConditions" boolean NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.contacts OWNER TO "greenworkAdmin";

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: greenworkAdmin
--

CREATE SEQUENCE public.contacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contacts_id_seq OWNER TO "greenworkAdmin";

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greenworkAdmin
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: greenworkAdmin
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO "greenworkAdmin";

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: greenworkAdmin
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.failed_jobs_id_seq OWNER TO "greenworkAdmin";

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greenworkAdmin
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: greenworkAdmin
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO "greenworkAdmin";

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: greenworkAdmin
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO "greenworkAdmin";

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greenworkAdmin
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: greenworkAdmin
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO "greenworkAdmin";

--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: greenworkAdmin
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO "greenworkAdmin";

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: greenworkAdmin
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.personal_access_tokens_id_seq OWNER TO "greenworkAdmin";

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greenworkAdmin
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: greenworkAdmin
--

CREATE TABLE public.reservations (
    user_id bigint NOT NULL,
    space_id bigint NOT NULL,
    reservation_period character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.reservations OWNER TO "greenworkAdmin";

--
-- Name: spaces; Type: TABLE; Schema: public; Owner: greenworkAdmin
--

CREATE TABLE public.spaces (
    id bigint NOT NULL,
    places integer NOT NULL,
    price double precision NOT NULL,
    schedule character varying(255) NOT NULL,
    images character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    subtitle character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.spaces OWNER TO "greenworkAdmin";

--
-- Name: spaces_id_seq; Type: SEQUENCE; Schema: public; Owner: greenworkAdmin
--

CREATE SEQUENCE public.spaces_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spaces_id_seq OWNER TO "greenworkAdmin";

--
-- Name: spaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greenworkAdmin
--

ALTER SEQUENCE public.spaces_id_seq OWNED BY public.spaces.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: greenworkAdmin
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    surname character varying(255) NOT NULL,
    dni character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    birthdate date NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    "termsAndConditions" boolean DEFAULT false NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.users OWNER TO "greenworkAdmin";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: greenworkAdmin
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO "greenworkAdmin";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: greenworkAdmin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: audits id; Type: DEFAULT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.audits ALTER COLUMN id SET DEFAULT nextval('public.audits_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: spaces id; Type: DEFAULT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.spaces ALTER COLUMN id SET DEFAULT nextval('public.spaces_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: greenworkAdmin
--

COPY public.admins (id, name, email, password, email_verified_at, remember_token, created_at, updated_at) FROM stdin;
1	Admin de Prueba	admin_test@example.com	$2y$12$5rxOwx.lDcGpOIkeTfSVLePgea9Ptd99xzy11ful2Z5kudq1T/exS	\N	\N	2025-05-14 11:41:26	2025-05-14 11:41:26
\.


--
-- Data for Name: audits; Type: TABLE DATA; Schema: public; Owner: greenworkAdmin
--

COPY public.audits (id, admin_id, action, table_name, record_id, old_values, new_values, created_at, updated_at) FROM stdin;
1	1	create	test_table	1	\N	"{\\"test_field\\":\\"test_value\\"}"	2025-05-14 11:41:26	2025-05-14 11:41:26
2	1	create	spaces	1	\N	"{\\"places\\":5,\\"price\\":25.99,\\"schedule\\":\\"Lun-Vie 9:00-18:00\\",\\"images\\":\\"espacio1.jpg\\",\\"description\\":\\"Espacio de trabajo amplio y luminoso\\",\\"subtitle\\":\\"Espacio ideal para equipos\\",\\"updated_at\\":\\"2025-05-14T11:44:00.000000Z\\",\\"created_at\\":\\"2025-05-14T11:44:00.000000Z\\",\\"id\\":1}"	2025-05-14 11:44:00	2025-05-14 11:44:00
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: greenworkAdmin
--

COPY public.contacts (id, email, "termsAndConditions", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: greenworkAdmin
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: greenworkAdmin
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	2014_10_12_000000_create_users_table	1
2	2014_10_12_100000_create_password_reset_tokens_table	1
3	2019_08_19_000000_create_failed_jobs_table	1
4	2019_12_14_000001_create_personal_access_tokens_table	1
5	2025_05_13_122401_create_spaces_table	1
6	2025_05_13_123000_create_reservations_table	1
7	2025_05_13_191230_create_admins_table	1
8	2025_05_14_000000_create_contacts_table	1
9	2025_05_14_112320_create_audits_table	1
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: greenworkAdmin
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: greenworkAdmin
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
1	App\\Models\\Admin	1	admin_token	49778a05beef8ba142d1f18f104004ccfda09a26f0d9b6c1eca686aef2e62c5e	["admin"]	2025-05-14 11:44:43	\N	2025-05-14 11:42:29	2025-05-14 11:44:43
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: greenworkAdmin
--

COPY public.reservations (user_id, space_id, reservation_period, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spaces; Type: TABLE DATA; Schema: public; Owner: greenworkAdmin
--

COPY public.spaces (id, places, price, schedule, images, description, subtitle, created_at, updated_at) FROM stdin;
1	5	25.99	Lun-Vie 9:00-18:00	espacio1.jpg	Espacio de trabajo amplio y luminoso	Espacio ideal para equipos	2025-05-14 11:44:00	2025-05-14 11:44:00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: greenworkAdmin
--

COPY public.users (id, name, surname, dni, email, birthdate, email_verified_at, password, "termsAndConditions", remember_token, created_at, updated_at) FROM stdin;
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: greenworkAdmin
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: audits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: greenworkAdmin
--

SELECT pg_catalog.setval('public.audits_id_seq', 2, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: greenworkAdmin
--

SELECT pg_catalog.setval('public.contacts_id_seq', 1, false);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: greenworkAdmin
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: greenworkAdmin
--

SELECT pg_catalog.setval('public.migrations_id_seq', 9, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: greenworkAdmin
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, true);


--
-- Name: spaces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: greenworkAdmin
--

SELECT pg_catalog.setval('public.spaces_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: greenworkAdmin
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: admins admins_email_unique; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_unique UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: audits audits_pkey; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.audits
    ADD CONSTRAINT audits_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (user_id, space_id, reservation_period);


--
-- Name: spaces spaces_pkey; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_pkey PRIMARY KEY (id);


--
-- Name: users users_dni_unique; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_dni_unique UNIQUE (dni);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: greenworkAdmin
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: audits audits_admin_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.audits
    ADD CONSTRAINT audits_admin_id_foreign FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_space_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_space_id_foreign FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: greenworkAdmin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

