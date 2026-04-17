type Props = {
  title?: string;
  message?: string;
};

export default function EmptyState({
  title = "No data",
  message = "There is nothing to display yet.",
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{message}</p>
    </div>
  );
}