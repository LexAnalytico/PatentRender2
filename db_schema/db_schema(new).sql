-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  description text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.patentprofiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text,
  first_name text,
  last_name text,
  company text,
  CONSTRAINT patentprofiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.patentrender (
  patent_search bigint,
  patent_application bigint,
  patent_portfolio bigint,
  trademark_search bigint,
  trademark_registration bigint,
  trademark_monitoring bigint,
  copyright_registration bigint,
  dmca_services bigint,
  copyright_licensing bigint,
  design_registration bigint,
  design_search bigint,
  design_portfolio bigint NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_examination bigint,
  CONSTRAINT patentrender_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payments (
  id integer NOT NULL DEFAULT nextval('payments_id_seq'::regclass),
  user_id uuid,
  total_amount numeric NOT NULL,
  payment_status text DEFAULT 'pending'::text,
  payment_date timestamp without time zone,
  razorpay_payment_id text,
  CONSTRAINT payments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.quotes (
  id bigint NOT NULL DEFAULT nextval('quotes_id_seq'::regclass),
  user_id uuid,
  category_id bigint,
  service_id bigint,
  application_type text,
  currency text,
  inputs_json jsonb,
  breakdown_json jsonb,
  subtotal numeric,
  tax numeric,
  total numeric,
  status text,
  rules_version text,
  pdf_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  finalized_at timestamp with time zone,
  CONSTRAINT quotes_pkey PRIMARY KEY (id),
  CONSTRAINT quotes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.service_durations (
  id integer NOT NULL DEFAULT nextval('service_durations_id_seq'::regclass),
  service_id integer,
  option_id integer,
  estimated_time interval,
  CONSTRAINT service_durations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.service_forms (
  service_id integer,
  form_schema jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id integer NOT NULL,
  CONSTRAINT service_forms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.service_pricing_rules (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  service_id bigint NOT NULL,
  application_type text NOT NULL CHECK (application_type = ANY (ARRAY['individual'::text, 'startup_msme'::text, 'others'::text])),
  key text NOT NULL,
  unit text NOT NULL CHECK (unit = ANY (ARRAY['fixed'::text, 'per_class'::text])),
  amount numeric NOT NULL,
  CONSTRAINT service_pricing_rules_pkey PRIMARY KEY (id),
  CONSTRAINT service_pricing_rules_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.services (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id bigint NOT NULL,
  name text NOT NULL,
  base_price numeric NOT NULL,
  description text,
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.user_service_selections (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  service_id integer,
  custom_price numeric,
  form_completed boolean DEFAULT false,
  form_response jsonb,
  option_id integer,
  CONSTRAINT user_service_selections_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  first_name text,
  last_name text,
  company text,
  phone text,
  address text,
  city text,
  state text,
  country text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Orders table: stores confirmed orders linked to a user, service, category and payment
CREATE TABLE public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  service_id bigint,
  category_id bigint,
  payment_id integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT orders_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id)
);