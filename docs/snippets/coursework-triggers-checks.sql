-- ─── CHECK: бизнес-правила на уровне СУБД ──────────────────────

ALTER TABLE products
    ADD CONSTRAINT products_price_positive
        CHECK (price > 0),
    ADD CONSTRAINT products_old_price_greater
        CHECK (old_price IS NULL OR old_price > price),
    ADD CONSTRAINT products_rating_range
        CHECK (rating_avg BETWEEN 0 AND 5),
    ADD CONSTRAINT products_reviews_nonnegative
        CHECK (reviews_count >= 0);

ALTER TABLE promo_codes
    ADD CONSTRAINT promo_codes_discount_range
        CHECK (discount > 0 AND discount < 1);

ALTER TABLE reviews
    ADD CONSTRAINT reviews_rating_range
        CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE orders
    ADD CONSTRAINT orders_subtotal_nonnegative CHECK (subtotal >= 0),
    ADD CONSTRAINT orders_discount_nonnegative CHECK (discount >= 0),
    ADD CONSTRAINT orders_total_nonnegative    CHECK (total    >= 0);

ALTER TABLE order_items
    ADD CONSTRAINT order_items_qty_positive CHECK (qty > 0),
    -- XOR-ограничение: позиция заказа - либо товар,
    -- либо набор, но не оба сразу и не ни одного
    ADD CONSTRAINT order_item_exactly_one CHECK (
        (product_id IS NOT NULL)::INT
        + (set_id IS NOT NULL)::INT = 1
    );

-- ─── Триггер 1: пересчёт среднего рейтинга товара ──────────────

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
            SELECT COUNT(*) FROM reviews
            WHERE product_id = target_id
        )
    WHERE id = target_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_recalc
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION recalc_product_rating();

-- ─── Триггер 2: автообновление orders.updated_at ───────────────

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
