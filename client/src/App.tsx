import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProductPage } from '@/pages/ProductPage';
import { SetsPage } from '@/pages/SetsPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { CheckoutSuccessPage } from '@/pages/CheckoutSuccessPage';
import { AuthPage } from '@/pages/AuthPage';
import { AccountPage } from '@/pages/AccountPage';
import { AboutPage } from '@/pages/AboutPage';
import { DeliveryPage } from '@/pages/DeliveryPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProductsPage } from '@/pages/admin/ProductsPage';
import { AdminCategoriesPage } from '@/pages/admin/CategoriesPage';
import { AdminSetsPage } from '@/pages/admin/SetsPage';
import { AdminOrdersPage } from '@/pages/admin/OrdersPage';
import { AdminUsersPage } from '@/pages/admin/UsersPage';
import { AdminPromoPage } from '@/pages/admin/PromoPage';
import { AdminMessagesPage } from '@/pages/admin/MessagesPage';
import { Placeholder } from '@/pages/Placeholder';
import { useAuth } from '@/store/auth';

function App() {
  const init = useAuth(s => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:id" element={<ProductPage />} />
          <Route path="/sets" element={<SetsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/account" element={<AccountPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products"   element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="sets"       element={<AdminSetsPage />} />
            <Route path="orders"     element={<AdminOrdersPage />} />
            <Route path="messages"   element={<AdminMessagesPage />} />
            <Route path="users"      element={<AdminUsersPage />} />
            <Route path="promo"      element={<AdminPromoPage />} />
          </Route>

          <Route path="*" element={<Placeholder title="Страница не найдена" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
