Table users {
  id UUID [pk, default: `gen_random_uuid()`]
  name TEXT [not null]
  email TEXT [unique, not null]
  phone TEXT [not null]
  created_at TIMESTAMP [default: `NOW()`]
}

Table categories {
  id SERIAL [pk]
  name TEXT [not null]
}

Table services {
  id SERIAL [pk]
  category_id INT [ref: > categories.id] // cascade delete in DB
  name TEXT [not null]
  base_price NUMERIC(10,2) [not null]
}

Table options {
  id SERIAL [pk]
  service_id INT [ref: > services.id] // cascade delete in DB
  name TEXT [not null] // e.g. Standard, Expedited, Rush
}

Table fee_structure {
  id SERIAL [pk]
  option_id INT [ref: > options.id] // cascade delete in DB
  professional_fee NUMERIC(10,2)
  govt_fee NUMERIC(10,2)
  total_fee NUMERIC(10,2)
}

Table service_forms {
  id SERIAL [pk]
  service_id INT [ref: > services.id] // cascade delete in DB
  form_schema JSONB
  created_at TIMESTAMP [default: `NOW()`]
}

Table user_service_selections {
  id SERIAL [pk]
  user_id UUID [ref: > users.id] // cascade delete in DB
  service_id INT [ref: > services.id] // cascade delete in DB
  option_id INT [ref: > options.id] // user must pick option
  custom_price NUMERIC(10,2)
  form_completed BOOLEAN [default: false]
  form_response JSONB // stores the user's filled form
  created_at TIMESTAMP [default: `NOW()`]
}

Table payments {
  id SERIAL [pk]
  user_id UUID [ref: > users.id] // cascade delete in DB
  total_amount NUMERIC(10,2) [not null]
  payment_status TEXT [default: 'pending', note: "Check in ('pending', 'completed', 'failed')"]
  payment_date TIMESTAMP
}

Table service_durations {
  id SERIAL [pk]
  service_id INT [ref: > services.id] // cascade delete in DB
  option_id INT [ref: > options.id] // optional: durations vary by option
  estimated_time INTERVAL
}