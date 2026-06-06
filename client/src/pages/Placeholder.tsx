interface PlaceholderProps {
  title: string;
}

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <section className="container-page py-20 text-center">
      <h1 className="font-oswald text-4xl uppercase text-brown">{title}</h1>
      <p className="mt-4 text-brown-soft">Страница в разработке</p>
    </section>
  );
}
