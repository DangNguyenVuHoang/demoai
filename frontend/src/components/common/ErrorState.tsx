type Props = {
  title?: string;
  message?: string;
};

export default function ErrorState({
  title = "Something went wrong",
  message = "Please try again later.",
}: Props) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}