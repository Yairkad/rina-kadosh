import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-[var(--gold)] mb-4">404</p>
      <h1 className="text-2xl font-semibold text-[var(--charcoal)] mb-2">הדף לא נמצא</h1>
      <p className="text-[var(--muted)] mb-8">הקישור שחיפשת אינו קיים או הוסר</p>
      <Link
        href="/"
        className="px-6 py-3 bg-[var(--gold)] text-white rounded-xl font-medium hover:bg-[#b8915a] transition-colors"
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
}
