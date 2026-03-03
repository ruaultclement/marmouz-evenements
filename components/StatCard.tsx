type StatCardProps = {
  label: string;
  value: number;
  accent?: "red" | "green" | "blue" | "yellow";
};

const accentClasses = {
  red: "border-[#D94A4A]",
  green: "border-[#2F5D50]",
  blue: "border-[#1F2A44]",
  yellow: "border-[#F6C945]",
};

export default function StatCard({
  label,
  value,
  accent = "green",
}: StatCardProps) {
  return (
    <div className={`festival-card border-l-4 ${accentClasses[accent]}`}>
      <p className="text-sm uppercase tracking-wide text-[#1F2A44]/70">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#1F2A44]">{value}</p>
    </div>
  );
}
