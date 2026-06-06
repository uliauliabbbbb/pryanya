import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Field } from './AdminUI';
import { cn } from '@/lib/utils';

interface Props {
  label?: string;
  value: string;
  onChange: (path: string) => void;
  required?: boolean;
  /** Если true — путь можно оставить пустым (для сетов) */
  optional?: boolean;
  /** Цвет фона за картинкой (для превью пряников на брендовом фоне) */
  previewBg?: string;
}

export function PhotoField({
  label = 'Фото',
  value,
  onChange,
  required,
  optional,
  previewBg,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.post<{ path: string }>('/upload/product-photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(r.data.path);
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error ?? 'Не удалось загрузить файл');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        {value ? (
          <div
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-brown/10"
            style={{ background: previewBg ?? '#FFF6F0' }}
          >
            <img
              src={value}
              alt=""
              className="h-full w-full object-contain"
              onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
            />
            {optional && (
              <button
                type="button"
                onClick={() => onChange('')}
                aria-label="Убрать"
                className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-bl-lg bg-pink text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ) : (
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-dashed border-brown/20 text-xs text-brown-soft">
            нет фото
          </div>
        )}

        <div className="min-w-0 flex-1">
          <input
            required={required && !value}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="/products/1_.png или /uploads/products/…"
            maxLength={255}
            className="input"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full bg-cream-2 px-3 py-1.5 text-xs font-semibold text-brown transition',
                uploading ? 'opacity-60' : 'hover:bg-pink-soft',
              )}
            >
              <Upload size={12} />
              {uploading ? 'Загружаю…' : 'Загрузить файл'}
            </button>
            {error && <span className="text-xs text-pink">{error}</span>}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="hidden"
          />
        </div>
      </div>
    </Field>
  );
}
