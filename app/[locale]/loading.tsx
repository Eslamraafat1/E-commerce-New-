export default function Loading() {
  return (
    <div className="container-x py-16" aria-busy="true" aria-live="polite">
      <div className="skeleton h-12 w-2/3 max-w-xl" />
      <div className="skeleton mt-4 h-5 w-1/2 max-w-md" />
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton aspect-[4/5]" />)}</div>
    </div>
  );
}
