-- ─── ENUM-типы ──────────────────────────────────────────────────

CREATE TYPE badge_type   AS ENUM ('Хит', 'Новинка', 'Сезонный', 'Премиум');
CREATE TYPE order_status AS ENUM ('В работе', 'Собирается', 'В пути', 'Доставлен');

-- ─── Справочники ────────────────────────────────────────────────

CREATE TABLE categories (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE ingredients (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE promo_codes (
    code        VARCHAR(50) PRIMARY KEY,
    discount    NUMERIC(4,3) NOT NULL CHECK (discount > 0 AND discount < 1),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    valid_until TIMESTAMPTZ
);

-- ─── Пользователи ───────────────────────────────────────────────

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    avatar        VARCHAR(255),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Продукты и связи ───────────────────────────────────────────

CREATE TABLE products (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    price         NUMERIC(10,2) NOT NULL CHECK (price > 0),
    old_price     NUMERIC(10,2) CHECK (old_price IS NULL OR old_price > price),
    category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    photo         VARCHAR(255) NOT NULL,
    badge         badge_type,
    description   TEXT NOT NULL,
    brand_bg      CHAR(7) NOT NULL,
    brand_is_dark BOOLEAN NOT NULL DEFAULT FALSE,
    rating_avg    NUMERIC(2,1) NOT NULL DEFAULT 0.0 CHECK (rating_avg BETWEEN 0 AND 5),
    reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_badge    ON products(badge) WHERE badge IS NOT NULL;

CREATE TABLE product_ingredients (
    product_id    INTEGER NOT NULL REFERENCES products(id)    ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    position      SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, ingredient_id)
);

CREATE TABLE sets (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    count       SMALLINT NOT NULL CHECK (count > 0),
    price       NUMERIC(10,2) NOT NULL CHECK (price > 0),
    old_price   NUMERIC(10,2) CHECK (old_price IS NULL OR old_price > price),
    description TEXT NOT NULL,
    photo       VARCHAR(255),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE set_items (
    set_id     INTEGER NOT NULL REFERENCES sets(id)     ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    qty        SMALLINT NOT NULL DEFAULT 1 CHECK (qty > 0),
    PRIMARY KEY (set_id, product_id)
);

-- ─── Отзывы ─────────────────────────────────────────────────────

CREATE TABLE reviews (
    id         SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, user_id)
);

-- ─── Адреса ─────────────────────────────────────────────────────

CREATE TABLE addresses (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city        VARCHAR(100) NOT NULL,
    street      VARCHAR(200) NOT NULL,
    building    VARCHAR(20) NOT NULL,
    apartment   VARCHAR(20),
    postal_code VARCHAR(20),
    is_default  BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── Заказы ─────────────────────────────────────────────────────

CREATE TABLE orders (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status     order_status NOT NULL DEFAULT 'В работе',
    subtotal   NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    discount   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total      NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    promo_code VARCHAR(50) REFERENCES promo_codes(code) ON DELETE SET NULL,
    address_id INTEGER     REFERENCES addresses(id)    ON DELETE SET NULL,
    notes      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_orders_user    ON orders(user_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TABLE order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    product_id INTEGER          REFERENCES products(id) ON DELETE SET NULL,
    set_id     INTEGER          REFERENCES sets(id)     ON DELETE SET NULL,
    name_snap  VARCHAR(200) NOT NULL,
    price_snap NUMERIC(10,2) NOT NULL,
    photo_snap VARCHAR(255),
    qty        SMALLINT NOT NULL CHECK (qty > 0),
    CONSTRAINT order_item_exactly_one CHECK (
        (product_id IS NOT NULL)::INT + (set_id IS NOT NULL)::INT = 1
    )
);

-- ─── Корзина ────────────────────────────────────────────────────

CREATE TABLE cart_items (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    product_id INTEGER          REFERENCES products(id) ON DELETE CASCADE,
    set_id     INTEGER          REFERENCES sets(id)     ON DELETE CASCADE,
    qty        SMALLINT NOT NULL DEFAULT 1 CHECK (qty > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT cart_item_exactly_one CHECK (
        (product_id IS NOT NULL)::INT + (set_id IS NOT NULL)::INT = 1
    )
);
CREATE INDEX idx_cart_user ON cart_items(user_id);

-- ─── Контентные таблицы ─────────────────────────────────────────

CREATE TABLE faq_items (
    id       SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer   TEXT NOT NULL,
    position SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE team_members (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    role     VARCHAR(100) NOT NULL,
    position SMALLINT NOT NULL DEFAULT 0
);

-- ════════════════════════════════════════════════════════════════
-- ТРИГГЕРЫ
-- ════════════════════════════════════════════════════════════════

-- 1. Пересчёт rating_avg и reviews_count при изменении отзывов
CREATE OR REPLACE FUNCTION recalc_product_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_id INTEGER;
BEGIN
    target_id := COALESCE(NEW.product_id, OLD.product_id);

    UPDATE products
    SET rating_avg = COALESCE((
            SELECT ROUND(AVG(rating)::NUMERIC, 1)
            FROM reviews WHERE product_id = target_id
        ), 0),
        reviews_count = (
            SELECT COUNT(*) FROM reviews WHERE product_id = target_id
        )
    WHERE id = target_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_recalc
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION recalc_product_rating();

-- 2. Авто-обновление orders.updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
