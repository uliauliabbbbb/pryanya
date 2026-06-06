# Шпаргалка для защиты курсовой по БД — Пряня

Документ для подготовки к устной защите. Здесь объяснено что и **почему** именно так. По каждому разделу — что говорить и какие вопросы могут задать.

---

## 1. Общая характеристика проекта

**Что:** Реляционная БД для интернет-магазина пряников ручной работы «Пряня».

**Что говорить:**
> «Я спроектировала реляционную базу данных для e-commerce проекта. СУБД — PostgreSQL 15. ORM — Prisma для типобезопасной работы из приложения. БД состоит из 15 таблиц, поддерживает полный цикл: каталог товаров, пользователи, корзина, заказы, отзывы с автоматическим пересчётом рейтинга.»

**Стек:**
- **СУБД:** PostgreSQL 15+
- **ORM:** Prisma 5
- **Тип IDs:** SERIAL (autoincrement INTEGER)
- **Схема:** все таблицы в schema `public`
- **Кодировка:** UTF-8

---

## 2. Сущности (15 таблиц)

Разделить на 4 логические группы:

### Справочники (статичные данные)
1. `categories` — категории пряников (Классика / Премиум / Сезонные)
2. `ingredients` — справочник ингредиентов (мука, мёд, корица...)
3. `promo_codes` — промокоды

### Основные сущности
4. `users` — пользователи
5. `products` — пряники (12 шт)
6. `sets` — подарочные сеты (4 шт)

### Связующие (M:N)
7. `product_ingredients` — состав каждого пряника
8. `set_items` — состав каждого сета

### Транзакционные
9. `reviews` — отзывы
10. `addresses` — адреса доставки
11. `orders` — заказы
12. `order_items` — позиции заказов
13. `cart_items` — корзина

### Контентные
14. `faq_items` — FAQ для страницы доставки
15. `team_members` — команда для страницы «О нас»

---

## 3. ER-диаграмма

```
users ──< orders, reviews, addresses, cart_items
categories ──< products
products ──< (product_ingredients) >── ingredients
sets ──< (set_items) >── products
orders ──< order_items >── products/sets (полиморфно)
addresses ──< orders
promo_codes ──< orders
products ──< reviews >── users
```

См. полную диаграмму на Mermaid в `docs/db-design.md`.

---

## 4. Нормализация — 3НФ (BCNF где возможно)

**Что говорить:**
> «БД приведена к третьей нормальной форме. Я объясню почему.»

### 1НФ — атомарность
Все атрибуты атомарны. Например, ингредиенты пряника не хранятся как массив или строка через запятую, а вынесены в отдельную таблицу `product_ingredients`.

### 2НФ — полная функциональная зависимость от PK
Каждый неключевой атрибут зависит от всего первичного ключа. В `product_ingredients` (PK = product_id + ingredient_id) поле `position` зависит от обоих ключей вместе — то есть позиция конкретного ингредиента в составе конкретного пряника.

### 3НФ — нет транзитивных зависимостей
- Категория не хранится строкой в `products`, а через `category_id → categories.id`
- Ингредиенты — отдельная таблица
- Промокоды — отдельная таблица

### Намеренные денормализации (с обоснованием)

Преподаватель может спросить: *«А почему у вас в products есть rating_avg и reviews_count? Это же денормализация — рейтинг можно вычислить из reviews.»*

**Ответ:**
> «Да, это намеренная денормализация для производительности — кэш агрегации. На странице каталога мы показываем 12 пряников с рейтингом; вычислять AVG и COUNT для каждого при каждом запросе — это 24 дополнительных запроса. Чтобы избежать этого, я храню кэш. Целостность кэша обеспечивается **триггером** `recalc_product_rating()`, который автоматически пересчитывает поля при любом изменении в таблице `reviews`. Так данные всегда консистентны.»

Вторая намеренная денормализация — снапшоты в `order_items`. Объяснение ниже.

---

## 5. Триггеры (важно для защиты!)

### Триггер 1: Пересчёт рейтинга

```sql
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
```

**Что говорить:**
> «Триггер срабатывает AFTER INSERT, UPDATE, DELETE на таблице `reviews`. Через `COALESCE(NEW.product_id, OLD.product_id)` я получаю id пряника независимо от типа операции — при INSERT доступен только NEW, при DELETE только OLD. Затем UPDATE пересчитывает AVG и COUNT по всем отзывам этого пряника. `RETURN NULL` потому что это AFTER-триггер, возвращаемое значение игнорируется.»

**Вероятные вопросы:**

- *Почему AFTER, а не BEFORE?* → Потому что нужно посчитать с уже изменённой строкой включительно. BEFORE-триггер видел бы данные до изменения.
- *Почему ROUND до 1 знака?* → Потому что в UI рейтинг показывается как «4.8», и `products.rating_avg` имеет тип `NUMERIC(2,1)`.
- *Почему COALESCE с 0?* → Если все отзывы удалили, AVG вернёт NULL — я подставляю 0.
- *А если 1000 отзывов?* → Триггер каждый раз пересчитывает по всем. На больших объёмах это дорого, но для нашего проекта 12 пряников × десятки отзывов — допустимо. Альтернатива: инкрементально считать через arithmetic, но это сложнее и подвержено накоплению ошибок.

### Триггер 2: Автообновление updated_at

```sql
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
```

**Что говорить:**
> «Этот триггер ставится BEFORE UPDATE — мы хотим изменить значение перед записью. Любое обновление заказа (изменение статуса, например) автоматически записывает текущее время в `updated_at`. Это снимает с приложения ответственность не забыть про этот столбец.»

---

## 6. CHECK-ограничения

Список основных:

| Таблица | Ограничение | Смысл |
|---|---|---|
| products | `price > 0` | Цена положительная |
| products | `old_price IS NULL OR old_price > price` | Старая цена должна быть больше новой (иначе скидка отрицательная) |
| products | `rating_avg BETWEEN 0 AND 5` | Защита от мусора |
| products | `reviews_count >= 0` | Защита от мусора |
| reviews | `rating BETWEEN 1 AND 5` | Только пятибалльная шкала |
| promo_codes | `discount > 0 AND discount < 1` | Скидка от 0 до 100% не включительно |
| order_items | `(product_id IS NOT NULL)::INT + (set_id IS NOT NULL)::INT = 1` | Ровно один из ссылок |
| cart_items | Тот же CHECK | То же |
| orders | `subtotal >= 0`, `discount >= 0`, `total >= 0` | Все суммы неотрицательные |

**Вероятный вопрос:** *Почему CHECK, а не валидация в приложении?*
> «БД должна оставаться валидной независимо от того, какое приложение в неё пишет. CHECK гарантирует целостность на уровне СУБД — даже если разработчик забудет валидацию в коде, или будет писать другая программа, или будет ручной SQL.»

---

## 7. Полиморфные позиции (`order_items`, `cart_items`)

**Проблема:** В корзину и в заказ можно положить и отдельный пряник, и сет. Как смоделировать?

**Моё решение (вариант A — рекомендуемый):**

```sql
CREATE TABLE order_items (
  ...
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  set_id     INTEGER REFERENCES sets(id)     ON DELETE SET NULL,
  ...
  CONSTRAINT order_item_exactly_one CHECK (
    (product_id IS NOT NULL)::INT + (set_id IS NOT NULL)::INT = 1
  )
);
```

**Что говорить:**
> «Я использовала паттерн "полиморфная ассоциация с CHECK-ограничением". У `order_items` есть два nullable FK: `product_id` и `set_id`. CHECK на уровне БД гарантирует, что ровно один из них не NULL. Альтернатива — две отдельные таблицы `order_product_items` и `order_set_items` — была бы строже типизирована, но требовала бы JOIN с обеими таблицами при чтении истории заказа.»

**Вопрос:** *Что если оба NULL?* → Отбьётся CHECK.
**Вопрос:** *Что если оба не-NULL?* → Тоже отбьётся CHECK.

---

## 8. Снапшоты в `order_items`

```sql
CREATE TABLE order_items (
  ...
  name_snap   VARCHAR(200) NOT NULL,
  price_snap  NUMERIC(10,2) NOT NULL,
  photo_snap  VARCHAR(255),
  qty         SMALLINT NOT NULL CHECK (qty > 0)
);
```

**Что говорить:**
> «В позициях заказа я храню снапшот данных на момент покупки: название, цену и фото. Это вторая намеренная денормализация. Если потом мы переименуем пряник или поменяем цену — исторические заказы должны показывать ТО, что клиент реально купил. Без снапшота, после удаления пряника (`ON DELETE SET NULL` на product_id) у нас не осталось бы никаких данных о позиции.»

---

## 9. Связи и каскады (ON DELETE)

| Связь | Стратегия | Почему |
|---|---|---|
| `products → categories` | RESTRICT | Нельзя удалить категорию, пока есть товары в ней |
| `product_ingredients → products` | CASCADE | Удалили продукт — чистим его состав |
| `product_ingredients → ingredients` | RESTRICT | Нельзя удалить ингредиент, пока он используется |
| `set_items → sets` | CASCADE | Удалили сет — чистим его состав |
| `set_items → products` | RESTRICT | Нельзя удалить продукт, пока он в сете |
| `reviews → products / users` | CASCADE | Удалили продукт/юзера — отзывы тоже исчезают |
| `addresses → users` | CASCADE | Юзер удаляется — адреса тоже |
| `orders → users` | **RESTRICT** | История заказов должна сохраняться, даже если юзера удалили (важно для отчётности) |
| `orders → addresses` | SET NULL | Адрес можно удалить, заказ остаётся без адреса |
| `orders → promo_codes` | SET NULL | Промокод деактивируется, исторический заказ помнит факт его применения |
| `order_items → orders` | CASCADE | Удалили заказ — позиции тоже |
| `order_items → products / sets` | **SET NULL** | Снапшот сохраняет инфо, ссылка может уйти |

**Вероятный вопрос:** *Почему `orders → users` RESTRICT, а не CASCADE?*
> «Заказы — финансовая история. Удалять их вместе с пользователем нельзя. В реальном бизнесе пользователя обычно "soft-delete" (флаг is_deleted), но даже жёсткое удаление не должно ломать историю. RESTRICT защищает от случайного удаления.»

---

## 10. Индексы

| Индекс | На чём | Зачем |
|---|---|---|
| `idx_users_email` UNIQUE | users(email) | Логин по email + защита от дубликатов |
| `idx_products_category` | products(category_id) | Фильтр каталога по категории |
| `idx_products_badge` partial | products(badge) WHERE badge IS NOT NULL | Поиск только товаров с бейджем |
| `idx_reviews_product_user` UNIQUE | reviews(product_id, user_id) | Один отзыв от юзера на товар + ускорение запроса «отзыв юзера N на товар M» |
| `idx_orders_user` | orders(user_id) | История заказов юзера |
| `idx_orders_created` | orders(created_at DESC) | Сортировка списка заказов по дате |
| `idx_cart_user` | cart_items(user_id) | Корзина юзера |
| PK по составному ключу | product_ingredients, set_items | Автоматически даёт индекс на (product_id, ingredient_id) и (set_id, product_id) |

**Вероятный вопрос:** *Что такое partial index?*
> «Это индекс только по подмножеству строк, удовлетворяющих условию (WHERE). У нас `badge` чаще всего NULL — индексировать NULL не нужно. Partial index экономит место и быстрее.»

---

## 11. ENUM-типы

```sql
CREATE TYPE badge_type   AS ENUM ('Хит', 'Новинка', 'Сезонный', 'Премиум');
CREATE TYPE order_status AS ENUM ('В работе', 'Собирается', 'В пути', 'Доставлен');
```

**Что говорить:**
> «Я использовала нативные PostgreSQL ENUM для полей с фиксированным набором значений. Альтернатива — отдельная таблица-справочник + FK, или VARCHAR с CHECK. ENUM компактнее, проще, типобезопасен на уровне СУБД, но менее гибок при добавлении новых значений (нужен `ALTER TYPE ADD VALUE`).»

---

## 12. Транзакции в коде приложения

Самый яркий пример — создание заказа (`POST /api/orders`):

```ts
const order = await prisma.$transaction(async (tx) => {
  // 1. Создать адрес (если есть)
  const address = await tx.address.create({ ... });
  // 2. Создать заказ
  return tx.order.create({
    data: { ..., addressId: address.id, items: { create: orderItems } },
  });
});
```

**Что говорить:**
> «Создание заказа происходит в транзакции, потому что нужно либо создать и адрес, и заказ с позициями, либо ничего. Если на середине упадёт CHECK или FK violation — Prisma откатит всю транзакцию.»

---

## 13. Часто задаваемые вопросы преподавателя

### Q: Почему PostgreSQL, а не MySQL/SQLite?
> «PostgreSQL поддерживает все нужные мне фичи: триггеры на plpgsql, native enums, partial indexes, NUMERIC для денежных значений, JSONB при необходимости. Он строже и стандартнее.»

### Q: Почему Prisma, а не чистый SQL?
> «Prisma даёт типобезопасную работу из TypeScript — нельзя случайно опечататься в имени столбца, компилятор поймает. Но миграции выполняются как обычный SQL, и я писала свою миграцию с триггерами и CHECK-ограничениями вручную, потому что Prisma не поддерживает их в schema.»

### Q: Покажите как у вас в коде используется индекс
> «Например, в `GET /api/orders` я запрашиваю заказы юзера с сортировкой по дате:
> ```ts
> prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 })
> ```
> Это использует `idx_orders_user` для WHERE и `idx_orders_created` для ORDER BY.»

### Q: Что будет при попытке создать второй отзыв от того же юзера на тот же товар?
> «UNIQUE constraint на `(product_id, user_id)` вернёт ошибку P2002 в Prisma — в моём `errorHandler.ts` это превращается в HTTP 409 Conflict.»

### Q: Какая у вас стратегия миграций?
> «Prisma Migrate. Каждая миграция — папка в `prisma/migrations/` с timestamped именем и `migration.sql` внутри. У меня две: `init` (создание таблиц) и `add_triggers_and_checks` (триггеры + CHECK, которые Prisma не умеет).»

### Q: А что если БД упадёт под нагрузкой?
> «Это не было задачей курсовой, но потенциальные узкие места: триггер пересчёта рейтинга при много-write нагрузке, и сериализованные транзакции при оформлении заказа. Решения: для рейтинга — materialized view с периодическим обновлением; для заказов — оптимистичная блокировка.»

### Q: Покажите как добавить новую таблицу
> «1) Описываю модель в `schema.prisma`. 2) Запускаю `npx prisma migrate dev --name add_X` — Prisma генерит миграцию-SQL. 3) Если нужны триггеры/CHECK — добавляю их через `migrate dev --create-only` + ручная правка.»

---

## 14. Как защититься на практической части

1. **Откройте pgAdmin** и покажите дерево таблиц
2. **Покажите DDL** одной таблицы (правый клик на products → CREATE Script)
3. **Покажите данные** — `SELECT * FROM products LIMIT 5;`
4. **Покажите работу триггера**:
   ```sql
   -- До
   SELECT name, rating_avg, reviews_count FROM products WHERE id = 1;
   -- Вставляем отзыв
   INSERT INTO reviews (product_id, user_id, rating) VALUES (1, 1, 5);
   -- После — рейтинг автоматически пересчитался
   SELECT name, rating_avg, reviews_count FROM products WHERE id = 1;
   ```
5. **Покажите работу CHECK**:
   ```sql
   -- Это упадёт с ошибкой:
   UPDATE products SET price = -100 WHERE id = 1;
   -- ERROR: new row for relation "products" violates check constraint "products_price_positive"
   ```
6. **Покажите ER-диаграмму** — `docs/db-design.md` (Mermaid рендерится на GitHub и в VS Code с расширением)

---

## 15. Что НЕЛЬЗЯ сказать (типичные ошибки студентов)

- ❌ «У меня одна большая таблица со всеми данными, всё работает» — нарушение нормализации
- ❌ «У меня везде CASCADE» — небезопасно для исторических данных
- ❌ «Триггеры не нужны, всё в коде приложения» — теряется целостность
- ❌ «У меня везде VARCHAR(255)» — нужно подбирать тип по смыслу (NUMERIC для денег, TIMESTAMPTZ для дат, ENUM для фиксированных значений)
- ❌ «Я не делала индексы, потому что данных мало» — индексы заявляются на стадии проектирования, не после

---

## 16. Чек-лист перед защитой

- [ ] Знаете количество таблиц и зачем каждая
- [ ] Можете объяснить нормализацию каждой таблицы
- [ ] Знаете разницу между BEFORE и AFTER триггерами
- [ ] Помните все три CHECK-ограничения на полиморфные item'ы
- [ ] Знаете стратегию ON DELETE для каждой ключевой связи
- [ ] Можете нарисовать ER-диаграмму на доске
- [ ] Понимаете зачем снапшоты в order_items
- [ ] Понимаете зачем кэш рейтинга в products
- [ ] Сможете на pgAdmin вживую показать таблицы и SQL
