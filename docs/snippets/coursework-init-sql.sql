-- CreateEnum
CREATE TYPE "user_role"    AS ENUM ('user', 'admin');
CREATE TYPE "order_status" AS ENUM ('В работе', 'Собирается',
                                    'В пути', 'Доставлен');
CREATE TYPE "badge_type"   AS ENUM ('Хит', 'Новинка',
                                    'Сезонный', 'Премиум');

-- CreateTable
CREATE TABLE "users" (
    "id"            SERIAL NOT NULL,
    "email"         VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name"          VARCHAR(100) NOT NULL,
    "role"          "user_role" NOT NULL DEFAULT 'user',
    "created_at"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
    "id"          SERIAL NOT NULL,
    "name"        VARCHAR(200) NOT NULL,
    "price"       DECIMAL(10,2) NOT NULL,
    "old_price"   DECIMAL(10,2),
    "category_id" INTEGER NOT NULL,
    "photo"       VARCHAR(255) NOT NULL,
    "badge"       "badge_type",
    "rating_avg"  DECIMAL(2,1) NOT NULL DEFAULT 0,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "products_category_id_idx"
    ON "products"("category_id");
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX "orders_created_at_idx"
    ON "orders"("created_at" DESC);

-- AddForeignKey: разные политики ON DELETE
ALTER TABLE "products" ADD CONSTRAINT
    "products_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_fkey"
    FOREIGN KEY ("address_id") REFERENCES "addresses"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT
    "order_items_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT
    "order_items_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
