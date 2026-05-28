"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { archiveBundle } from "@/app/admin/actions/bundles";

export default function ArchiveBundleButton({ bundleId }: { bundleId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleArchive() {
    if (!confirm("להעביר חבילה זו לארכיון?")) return;
    startTransition(async () => {
      await archiveBundle(bundleId);
      router.push("/admin/bundles");
      router.refresh();
    });
  }

  return (
    <button onClick={handleArchive} disabled={isPending}
      className="flex items-center gap-2 text-sm text-stone-500 hover:text-red-600 border border-stone-200 hover:border-red-200 px-4 py-2 rounded-xl transition-colors">
      <Archive size={15} />
      {isPending ? "מעביר לארכיון..." : "העבר לארכיון"}
    </button>
  );
}
