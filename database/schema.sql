-- ============================================================
--   DOG'S OWN PLACE  ·  Full Database Schema
--   Compatible with: PostgreSQL 14+ | MySQL 8+ | SQLite 3.35+
--   Version: 1.0  |  Author: DOP Engineering
-- ============================================================

-- NOTE: PostgreSQL syntax used throughout.
-- For MySQL: replace SERIAL → INT AUTO_INCREMENT,
--            BOOLEAN → TINYINT(1), UUID() → uuid(), INTERVAL → DATE_SUB.
-- For SQLite: replace SERIAL → INTEGER PRIMARY KEY AUTOINCREMENT,
--             remove TYPE casts, use TEXT for TIMESTAMP/ENUM fields.

-- ────────────────────────────────────────────────────────────
-- SECTION 1: EXTENSIONS & SETTINGS
-- ────────────────────────────────────────────────────────────
-- (PostgreSQL only; remove for MySQL/SQLite)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- SECTION 2: CORE USER TABLES
-- ────────────────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(120)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    phone           VARCHAR(20),
    password_hash   TEXT            NOT NULL,                  -- bcrypt hash, min 12 rounds
    role            VARCHAR(20)     NOT NULL DEFAULT 'user'
                                    CHECK (role IN ('user', 'admin', 'staff', 'vet', 'walker')),
    avatar_url      TEXT,
    city            VARCHAR(80),
    state           VARCHAR(80),
    pincode         VARCHAR(10),
    address_line1   TEXT,
    address_line2   TEXT,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN         NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP                                  -- soft delete
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_phone    ON users(phone);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_city     ON users(city);

-- ────────────────────────────────────────────────────────────
-- SECTION 3: AUTHENTICATION & SESSION TABLES
-- ────────────────────────────────────────────────────────────

CREATE TABLE auth_tokens (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      TEXT            NOT NULL UNIQUE,           -- SHA-256 hash of the actual token
    token_type      VARCHAR(30)     NOT NULL
                                    CHECK (token_type IN ('email_verify', 'password_reset', 'refresh', 'api')),
    expires_at      TIMESTAMP       NOT NULL,
    used_at         TIMESTAMP,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_hash    ON auth_tokens(token_hash);

CREATE TABLE user_sessions (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token   TEXT            NOT NULL UNIQUE,
    ip_address      INET,
    user_agent      TEXT,
    device_type     VARCHAR(30),                               -- 'mobile', 'tablet', 'desktop'
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    last_active_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP       NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token   ON user_sessions(session_token);

-- ────────────────────────────────────────────────────────────
-- SECTION 4: DOG PROFILES
-- ────────────────────────────────────────────────────────────

CREATE TABLE dogs (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(80)     NOT NULL,
    breed           VARCHAR(100),
    mixed_breed     BOOLEAN         DEFAULT FALSE,
    gender          VARCHAR(10)     CHECK (gender IN ('male', 'female', 'unknown')),
    date_of_birth   DATE,
    weight_kg       DECIMAL(5, 2),
    color           VARCHAR(80),
    microchip_id    VARCHAR(60),
    is_neutered     BOOLEAN         DEFAULT FALSE,
    is_vaccinated   BOOLEAN         DEFAULT FALSE,
    photo_url       TEXT,
    notes           TEXT,                                      -- owner's personal notes
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_dogs_owner_id ON dogs(owner_id);

CREATE TABLE dog_health_records (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id          UUID            NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    recorded_by     UUID            REFERENCES users(id),      -- vet/staff user id
    record_type     VARCHAR(40)     NOT NULL
                                    CHECK (record_type IN ('checkup', 'vaccination', 'medication', 'surgery', 'allergy', 'weight', 'note')),
    title           VARCHAR(200)    NOT NULL,
    description     TEXT,
    value           VARCHAR(100),                              -- e.g. weight value, vaccine name
    unit            VARCHAR(20),                              -- e.g. 'kg', 'ml'
    recorded_on     DATE            NOT NULL DEFAULT CURRENT_DATE,
    next_due_on     DATE,                                     -- e.g. next vaccine due date
    document_url    TEXT,                                     -- uploaded certificate / report PDF
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_dog_id ON dog_health_records(dog_id);
CREATE INDEX idx_health_type   ON dog_health_records(record_type);

CREATE TABLE dog_allergies (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id      UUID            NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    allergen    VARCHAR(120)    NOT NULL,
    severity    VARCHAR(20)     CHECK (severity IN ('mild', 'moderate', 'severe')),
    notes       TEXT,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SECTION 5: SERVICES CATALOG
-- ────────────────────────────────────────────────────────────

CREATE TABLE services (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(60)     NOT NULL UNIQUE,           -- 'grooming', 'training', etc.
    title           VARCHAR(120)    NOT NULL,
    short_desc      VARCHAR(255),
    description     TEXT,
    icon            VARCHAR(10),                               -- emoji or icon name
    image_url       TEXT,
    duration_minutes INT,
    price_basic     INTEGER         NOT NULL,                  -- in INR (paise not used)
    price_standard  INTEGER         NOT NULL,
    price_premium   INTEGER         NOT NULL,
    home_visit_fee  INTEGER         NOT NULL DEFAULT 200,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    sort_order      SMALLINT        NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

INSERT INTO services (slug, title, short_desc, price_basic, price_standard, price_premium, duration_minutes, sort_order) VALUES
('training',      'Dog Training',       'Professional obedience & behavior training',  1200, 2500, 4500, 60,  1),
('walking',       'Dog Walking',        'Daily walks by certified dog walkers',         400,  700,  1200, 45,  2),
('healthcheckup', 'Health Checkup',     'Comprehensive wellness examinations',           800,  1800, 3500, 45,  3),
('vaccination',   'Vaccinations',       'Timely immunizations & deworming',             500,  1000, 2000, 20,  4),
('grooming',      'Dog Grooming',       'Spa-level grooming & styling',                 600,  1200, 2500, 90,  5),
('daycare',       'Dog Daycare',        'Safe, fun supervised daycare',                 700,  1400, 2800, 480, 6),
('emergency',     'Emergency Care',     '24/7 emergency vet consultation',              1500, 3000, 6000, 0,   7),
('nutrition',     'Nutrition Planning', 'Custom diet plans by pet nutritionists',       900,  1800, 3200, 30,  8);

CREATE TABLE service_features (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id  UUID            NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    feature     VARCHAR(120)    NOT NULL,
    sort_order  SMALLINT        DEFAULT 0
);

-- ────────────────────────────────────────────────────────────
-- SECTION 6: STAFF & PROFESSIONAL PROFILES
-- ────────────────────────────────────────────────────────────

CREATE TABLE staff_profiles (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    staff_type      VARCHAR(30)     NOT NULL
                                    CHECK (staff_type IN ('trainer', 'vet', 'walker', 'groomer', 'nutritionist', 'admin')),
    bio             TEXT,
    experience_years INT,
    certifications  TEXT[],                                   -- array of cert names
    rating          DECIMAL(3, 2)   DEFAULT 5.00,
    total_reviews   INT             DEFAULT 0,
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,
    cities          TEXT[],                                   -- cities they serve
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_service_assignments (
    staff_id    UUID    NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    service_id  UUID    NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, service_id)
);

CREATE TABLE staff_availability (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id    UUID            NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    day_of_week SMALLINT        NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun, 6=Sat
    start_time  TIME            NOT NULL,
    end_time    TIME            NOT NULL,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ────────────────────────────────────────────────────────────
-- SECTION 7: APPOINTMENTS & BOOKINGS
-- ────────────────────────────────────────────────────────────

CREATE TABLE appointments (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref     VARCHAR(20)     NOT NULL UNIQUE,           -- human-readable e.g. 'DOP-2024-00123'
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    dog_id          UUID            REFERENCES dogs(id) ON DELETE SET NULL,
    service_id      UUID            NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    staff_id        UUID            REFERENCES staff_profiles(id) ON DELETE SET NULL,
    plan            VARCHAR(20)     NOT NULL DEFAULT 'standard'
                                    CHECK (plan IN ('basic', 'standard', 'premium')),
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    scheduled_at    TIMESTAMP       NOT NULL,
    duration_minutes INT,
    is_home_visit   BOOLEAN         NOT NULL DEFAULT FALSE,
    home_address    TEXT,
    base_price      INTEGER         NOT NULL,
    travel_fee      INTEGER         NOT NULL DEFAULT 0,
    discount_amount INTEGER         NOT NULL DEFAULT 0,
    total_price     INTEGER         GENERATED ALWAYS AS (base_price + travel_fee - discount_amount) STORED,
    user_notes      TEXT,
    staff_notes     TEXT,
    cancelled_at    TIMESTAMP,
    cancelled_by    UUID            REFERENCES users(id),
    cancel_reason   TEXT,
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appt_user_id    ON appointments(user_id);
CREATE INDEX idx_appt_dog_id     ON appointments(dog_id);
CREATE INDEX idx_appt_service_id ON appointments(service_id);
CREATE INDEX idx_appt_staff_id   ON appointments(staff_id);
CREATE INDEX idx_appt_status     ON appointments(status);
CREATE INDEX idx_appt_scheduled  ON appointments(scheduled_at);

CREATE TABLE appointment_status_log (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id  UUID            NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    old_status      VARCHAR(20),
    new_status      VARCHAR(20)     NOT NULL,
    changed_by      UUID            REFERENCES users(id),
    note            TEXT,
    changed_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SECTION 8: PAYMENTS & TRANSACTIONS
-- ────────────────────────────────────────────────────────────

CREATE TABLE payments (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id      UUID            NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount              INTEGER         NOT NULL,              -- in INR
    currency            CHAR(3)         NOT NULL DEFAULT 'INR',
    status              VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                        CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded', 'partially_refunded')),
    payment_method      VARCHAR(30)
                                        CHECK (payment_method IN ('upi', 'card', 'net_banking', 'wallet', 'cash', 'emi')),
    gateway             VARCHAR(30)     DEFAULT 'razorpay',   -- 'razorpay', 'paytm', 'stripe'
    gateway_order_id    TEXT,                                 -- from payment gateway
    gateway_payment_id  TEXT,                                 -- txn ID from gateway
    gateway_signature   TEXT,                                 -- webhook signature
    gateway_response    JSONB,                                -- full raw response
    paid_at             TIMESTAMP,
    failure_reason      TEXT,
    refund_amount       INTEGER         DEFAULT 0,
    refunded_at         TIMESTAMP,
    refund_txn_id       TEXT,
    invoice_url         TEXT,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_appt_id    ON payments(appointment_id);
CREATE INDEX idx_payments_user_id    ON payments(user_id);
CREATE INDEX idx_payments_status     ON payments(status);
CREATE INDEX idx_payments_gateway_id ON payments(gateway_payment_id);

CREATE TABLE coupons (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(30)     NOT NULL UNIQUE,
    description     VARCHAR(255),
    discount_type   VARCHAR(20)     NOT NULL CHECK (discount_type IN ('flat', 'percent')),
    discount_value  INTEGER         NOT NULL,                 -- INR amount or percent integer
    max_discount    INTEGER,                                  -- cap for percent discounts
    min_order_value INTEGER         DEFAULT 0,
    max_uses        INT,
    uses_per_user   INT             DEFAULT 1,
    total_used      INT             NOT NULL DEFAULT 0,
    valid_from      TIMESTAMP       NOT NULL DEFAULT NOW(),
    valid_until     TIMESTAMP,
    applicable_to   TEXT[],                                   -- service slugs, empty = all
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_by      UUID            REFERENCES users(id),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE coupon_uses (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id   UUID    NOT NULL REFERENCES coupons(id),
    user_id     UUID    NOT NULL REFERENCES users(id),
    payment_id  UUID    REFERENCES payments(id),
    used_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SECTION 9: REVIEWS & RATINGS
-- ────────────────────────────────────────────────────────────

CREATE TABLE reviews (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id  UUID            NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id      UUID            NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    staff_id        UUID            REFERENCES staff_profiles(id) ON DELETE SET NULL,
    rating          SMALLINT        NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           VARCHAR(200),
    body            TEXT,
    is_published    BOOLEAN         NOT NULL DEFAULT TRUE,
    admin_reply     TEXT,
    replied_at      TIMESTAMP,
    helpful_count   INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_service_id ON reviews(service_id);
CREATE INDEX idx_reviews_user_id    ON reviews(user_id);
CREATE INDEX idx_reviews_rating     ON reviews(rating);

-- ────────────────────────────────────────────────────────────
-- SECTION 10: NOTIFICATIONS & REMINDERS
-- ────────────────────────────────────────────────────────────

CREATE TABLE notifications (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(40)     NOT NULL,                 -- 'booking_confirmed', 'payment_success', etc.
    title           VARCHAR(200)    NOT NULL,
    body            TEXT,
    data            JSONB,                                    -- extra structured payload
    channel         VARCHAR(20)     NOT NULL DEFAULT 'in_app'
                                    CHECK (channel IN ('in_app', 'email', 'sms', 'push', 'whatsapp')),
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMP,
    sent_at         TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifs_user_id ON notifications(user_id);
CREATE INDEX idx_notifs_read    ON notifications(user_id, is_read);

CREATE TABLE vaccination_reminders (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id          UUID            NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vaccine_name    VARCHAR(120)    NOT NULL,
    due_date        DATE            NOT NULL,
    reminded_at     TIMESTAMP[],                              -- log of reminder send times
    is_completed    BOOLEAN         NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SECTION 11: GPS TRACKING (DOG WALKS)
-- ────────────────────────────────────────────────────────────

CREATE TABLE walk_sessions (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id  UUID            NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    staff_id        UUID            REFERENCES staff_profiles(id),
    dog_id          UUID            REFERENCES dogs(id),
    status          VARCHAR(20)     NOT NULL DEFAULT 'not_started'
                                    CHECK (status IN ('not_started', 'in_progress', 'paused', 'completed')),
    started_at      TIMESTAMP,
    ended_at        TIMESTAMP,
    total_distance_m INT,                                     -- in metres
    steps_count     INT,
    route_polyline  TEXT,                                     -- encoded Google Maps polyline
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE walk_gps_points (
    id              BIGSERIAL       PRIMARY KEY,
    session_id      UUID            NOT NULL REFERENCES walk_sessions(id) ON DELETE CASCADE,
    lat             DECIMAL(10, 7)  NOT NULL,
    lng             DECIMAL(10, 7)  NOT NULL,
    accuracy_m      DECIMAL(6, 2),
    speed_kmh       DECIMAL(5, 2),
    recorded_at     TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gps_session_id ON walk_gps_points(session_id);
CREATE INDEX idx_gps_recorded   ON walk_gps_points(session_id, recorded_at);

CREATE TABLE walk_updates (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID            NOT NULL REFERENCES walk_sessions(id) ON DELETE CASCADE,
    update_type     VARCHAR(20)     CHECK (update_type IN ('photo', 'note', 'incident', 'milestone')),
    message         TEXT,
    photo_url       TEXT,
    lat             DECIMAL(10, 7),
    lng             DECIMAL(10, 7),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SECTION 12: LOYALTY & REFERRALS
-- ────────────────────────────────────────────────────────────

CREATE TABLE loyalty_points (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20)    NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
    points          INT             NOT NULL,                 -- positive = earned, negative = redeemed
    balance_after   INT             NOT NULL,
    reference_id    UUID,                                    -- appointment_id or payment_id
    description     VARCHAR(255),
    expires_at      TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE referrals (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id     UUID            NOT NULL REFERENCES users(id),
    referred_id     UUID            NOT NULL UNIQUE REFERENCES users(id),
    referral_code   VARCHAR(20)     NOT NULL,
    status          VARCHAR(20)     DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'completed', 'rewarded')),
    referrer_reward INT             DEFAULT 500,             -- INR credit
    referred_reward INT             DEFAULT 200,             -- INR credit
    rewarded_at     TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SECTION 13: CONTENT & CMS
-- ────────────────────────────────────────────────────────────

CREATE TABLE blog_posts (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(200)    NOT NULL UNIQUE,
    title           VARCHAR(300)    NOT NULL,
    excerpt         TEXT,
    body            TEXT            NOT NULL,
    cover_image_url TEXT,
    author_id       UUID            REFERENCES users(id) ON DELETE SET NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'draft'
                                    CHECK (status IN ('draft', 'published', 'archived')),
    tags            TEXT[],
    view_count      INT             NOT NULL DEFAULT 0,
    published_at    TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE faqs (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id  UUID            REFERENCES services(id) ON DELETE SET NULL,
    question    TEXT            NOT NULL,
    answer      TEXT            NOT NULL,
    sort_order  SMALLINT        DEFAULT 0,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SECTION 14: AUDIT LOG
-- ────────────────────────────────────────────────────────────

CREATE TABLE audit_log (
    id              BIGSERIAL       PRIMARY KEY,
    actor_id        UUID            REFERENCES users(id) ON DELETE SET NULL,
    actor_role      VARCHAR(20),
    action          VARCHAR(80)     NOT NULL,                -- 'user.deleted', 'booking.cancelled', etc.
    entity_type     VARCHAR(60),                            -- table name
    entity_id       UUID,
    old_data        JSONB,
    new_data        JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor_id   ON audit_log(actor_id);
CREATE INDEX idx_audit_entity     ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at);

-- ────────────────────────────────────────────────────────────
-- SECTION 15: TRIGGERS
-- ────────────────────────────────────────────────────────────

-- Auto-update updated_at on all main tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['users','dogs','appointments','payments','services','reviews'] LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- Generate human-readable booking reference
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_ref := 'DOP-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
    LPAD(NEXTVAL('booking_ref_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START 1;

CREATE TRIGGER trg_appointment_booking_ref
  BEFORE INSERT ON appointments
  FOR EACH ROW
  WHEN (NEW.booking_ref IS NULL OR NEW.booking_ref = '')
  EXECUTE FUNCTION generate_booking_ref();

-- Log appointment status changes
CREATE OR REPLACE FUNCTION log_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO appointment_status_log(appointment_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointment_status_log
  AFTER UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION log_appointment_status_change();

-- Increment service total_reviews count on new review
CREATE OR REPLACE FUNCTION update_service_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services SET updated_at = NOW() WHERE id = NEW.service_id;
  IF NEW.staff_id IS NOT NULL THEN
    UPDATE staff_profiles
    SET rating = (SELECT AVG(rating) FROM reviews WHERE staff_id = NEW.staff_id AND is_published = TRUE),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE staff_id = NEW.staff_id AND is_published = TRUE)
    WHERE id = NEW.staff_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_stats
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_service_review_stats();

-- Award loyalty points on completed payment
CREATE OR REPLACE FUNCTION award_loyalty_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  points_earned INT;
  current_balance INT;
BEGIN
  IF NEW.status = 'success' AND (OLD.status IS NULL OR OLD.status != 'success') THEN
    points_earned := FLOOR(NEW.amount / 100);  -- 1 point per ₹100
    SELECT COALESCE(SUM(points), 0) INTO current_balance
      FROM loyalty_points WHERE user_id = NEW.user_id;
    INSERT INTO loyalty_points(user_id, transaction_type, points, balance_after, reference_id, description)
    VALUES (NEW.user_id, 'earned', points_earned, current_balance + points_earned, NEW.id,
            'Points earned for booking payment #' || NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_loyalty_on_payment
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION award_loyalty_on_payment();

-- ────────────────────────────────────────────────────────────
-- SECTION 16: USEFUL VIEWS
-- ────────────────────────────────────────────────────────────

-- Full booking details view
CREATE VIEW v_booking_details AS
SELECT
  a.id,
  a.booking_ref,
  a.status,
  a.scheduled_at,
  a.plan,
  a.base_price,
  a.total_price,
  a.is_home_visit,
  u.name           AS customer_name,
  u.email          AS customer_email,
  u.phone          AS customer_phone,
  u.city           AS customer_city,
  d.name           AS dog_name,
  d.breed          AS dog_breed,
  s.title          AS service_name,
  s.slug           AS service_slug,
  sp.user_id       AS staff_user_id,
  su.name          AS staff_name,
  p.status         AS payment_status,
  p.gateway_payment_id,
  a.created_at
FROM appointments a
JOIN users u         ON u.id = a.user_id
LEFT JOIN dogs d     ON d.id = a.dog_id
JOIN services s      ON s.id = a.service_id
LEFT JOIN staff_profiles sp ON sp.id = a.staff_id
LEFT JOIN users su   ON su.id = sp.user_id
LEFT JOIN payments p ON p.appointment_id = a.id
WHERE a.deleted_at IS NULL;

-- Revenue summary by service
CREATE VIEW v_revenue_by_service AS
SELECT
  s.slug,
  s.title,
  COUNT(p.id)         AS total_payments,
  SUM(p.amount)       AS total_revenue,
  AVG(p.amount)       AS avg_payment,
  SUM(p.refund_amount) AS total_refunds
FROM services s
LEFT JOIN appointments a ON a.service_id = s.id
LEFT JOIN payments p     ON p.appointment_id = a.id AND p.status = 'success'
GROUP BY s.id, s.slug, s.title;

-- User lifetime value
CREATE VIEW v_user_ltv AS
SELECT
  u.id,
  u.name,
  u.email,
  u.city,
  COUNT(DISTINCT a.id)   AS total_bookings,
  COUNT(DISTINCT d.id)   AS total_dogs,
  COALESCE(SUM(p.amount), 0) AS lifetime_value,
  MAX(a.scheduled_at)    AS last_booking_at,
  COALESCE(SUM(lp.points), 0) AS loyalty_points_balance
FROM users u
LEFT JOIN appointments a ON a.user_id = u.id
LEFT JOIN dogs d         ON d.owner_id = u.id AND d.deleted_at IS NULL
LEFT JOIN payments p     ON p.appointment_id = a.id AND p.status = 'success'
LEFT JOIN loyalty_points lp ON lp.user_id = u.id
WHERE u.role = 'user' AND u.deleted_at IS NULL
GROUP BY u.id, u.name, u.email, u.city;

-- ────────────────────────────────────────────────────────────
-- SECTION 17: DEFAULT SEED DATA
-- ────────────────────────────────────────────────────────────

INSERT INTO users (name, email, password_hash, role, city, is_active, is_verified) VALUES
  ('Admin User',    'admin@dogsownplace.com', '$2b$12$placeholder_hash_admin',    'admin',  'Mumbai',    TRUE, TRUE),
  ('Staff - Anita', 'anita@dogsownplace.com', '$2b$12$placeholder_hash_staff1',   'vet',    'Delhi',     TRUE, TRUE),
  ('Staff - Raj',   'raj@dogsownplace.com',   '$2b$12$placeholder_hash_staff2',   'walker', 'Bangalore', TRUE, TRUE);

INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_uses, valid_until) VALUES
  ('WELCOME200',  'Welcome discount for new users',         'flat',    200,  500,  NULL, NOW() + INTERVAL '1 year'),
  ('FIRST10',     '10% off your first booking',             'percent', 10,   NULL, NULL, NOW() + INTERVAL '6 months'),
  ('SUMMER500',   'Summer special - flat ₹500 off',         'flat',    500,  2000, 500,  '2025-06-30 23:59:59'),
  ('PREM20',      '20% off all premium plan bookings',      'percent', 20,   1500, 1000, NOW() + INTERVAL '3 months');

-- ────────────────────────────────────────────────────────────
-- END OF SCHEMA
-- ============================================================
-- Tables   : 24
-- Triggers : 5 (auto-timestamp, booking-ref, status-log,
--               review-stats, loyalty-points)
-- Views    : 3 (booking_details, revenue_by_service, user_ltv)
-- Indexes  : 20+
-- ============================================================
