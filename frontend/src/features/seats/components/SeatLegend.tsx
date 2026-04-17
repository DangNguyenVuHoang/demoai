export default function SeatLegend() {
  const items = [
    {
      label: "Available",
      className: "bg-white border border-slate-300",
    },
    {
      label: "Selected",
      className: "bg-blue-600",
    },
    {
      label: "Booked",
      className: "bg-red-500",
    },
    {
      label: "Locked",
      className: "bg-slate-400",
    },
    {
      label: "VIP",
      className: "bg-white border-2 border-amber-400",
    },
    {
      label: "Couple",
      className: "bg-white border-2 border-pink-400",
    },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`h-4 w-4 rounded ${item.className}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}