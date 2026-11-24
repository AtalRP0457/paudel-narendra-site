type Props = { title: string; intro?: string };

export default function PageHeader({ title, intro }: Props) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {intro && <p>{intro}</p>}
    </div>
  );
}
