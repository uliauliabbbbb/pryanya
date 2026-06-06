interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="container-page py-12 text-center sm:py-[70px] sm:pb-9">
      <h1 className="font-oswald text-[clamp(40px,5.4vw,68px)] uppercase leading-[1.05] text-brown">
        {title}
      </h1>
      {subtitle && (
        <p
          className="mx-auto mt-5 max-w-[620px] font-geometria text-[20px] leading-[1.25] text-brown-soft"
          style={{ fontWeight: 300 }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
