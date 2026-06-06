import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useCart } from '@/store/cart';

export function Toast() {
  const toast = useCart(s => s.toast);
  const clearToast = useCart(s => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(clearToast, 2500);
    return () => clearTimeout(id);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 inline-flex items-center gap-2.5 rounded-full bg-brown px-5 py-3.5 text-sm font-medium text-white shadow-lg animate-scaleIn">
      <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-pink text-white">
        <Check size={14} strokeWidth={3} />
      </span>
      {toast}
    </div>
  );
}
