-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_users (
  user_id uuid NOT NULL,
  email USER-DEFINED NOT NULL UNIQUE,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin1'::text, 'admin2'::text, 'admin3'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (user_id),
  CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  description text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.form_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT '4675b777-e24b-4b87-bc8a-d1621a6a0f94'::uuid,
  order_id integer DEFAULT 12345,
  form_type text DEFAULT 'patent_application_filing'::text,
  form_response_id uuid,
  filename text NOT NULL DEFAULT 'figure-sheet-1.pdf'::text,
  storage_path text NOT NULL DEFAULT 'users/11111111'::text,
  mime_type text DEFAULT 'application/pdf'::text,
  size_bytes bigint DEFAULT '84210'::bigint,
  sha256 text,
  deleted boolean DEFAULT false,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT form_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT form_attachments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.form_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id bigint,
  form_type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  fields_filled_count integer NOT NULL DEFAULT 0,
  fields_total integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT form_responses_pkey PRIMARY KEY (id),
  CONSTRAINT form_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT form_responses_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.order_admin_assignments (
  id bigint NOT NULL DEFAULT nextval('order_admin_assignments_id_seq'::regclass),
  order_id bigint NOT NULL,
  assigned_by USER-DEFINED NOT NULL,
  assigned_to USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_admin_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT order_admin_assignments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.order_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id integer NOT NULL,
  sender_role text NOT NULL CHECK (sender_role = ANY (ARRAY['admin'::text, 'user'::text])),
  sender_email text,
  message text NOT NULL,
  meta jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_messages_pkey PRIMARY KEY (id),
  CONSTRAINT order_messages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.orders (
  id bigint NOT NULL DEFAULT nextval('orders_id_seq'::regclass),
  user_id uuid,
  service_id bigint,
  category_id bigint,
  payment_id integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type text CHECK (type IS NULL OR (type = ANY (ARRAY['patentability_search'::text, 'drafting'::text, 'provisional_filing'::text, 'complete_non_provisional_filing'::text, 'pct_filing'::text, 'ps_cs'::text, 'fer_response'::text, 'trademark'::text, 'copyrights'::text, 'design'::text]))),
  amount numeric,
  assigned_to text,
  responsible text,
  workflow_status text CHECK (workflow_status IS NULL OR (workflow_status = ANY (ARRAY['in_progress'::text, 'require_info'::text, 'completed'::text]))),
  require_info_message text CHECK (require_info_message IS NULL OR char_length(require_info_message) <= 25),
  require_info_reply text CHECK (require_info_reply IS NULL OR char_length(require_info_reply) <= 25),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT orders_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id)
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
  razorpay_order_id text,
  created_at timestamp with time zone DEFAULT now(),
  service_id integer,
  type text CHECK (type IS NULL OR (type = ANY (ARRAY['patentability_search'::text, 'drafting'::text, 'provisional_filing'::text, 'complete_non_provisional_filing'::text, 'pct_filing'::text, 'ps_cs'::text, 'fer_response'::text, 'trademark'::text, 'copyrights'::text, 'design'::text]))),
  payment_method text,
  payment_method_details jsonb,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
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
  form_type text,
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