import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, email")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-stone-50 flex" dir="rtl">
      <AdminSidebar email={profile.email} />
      <main className="flex-1 min-w-0 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
