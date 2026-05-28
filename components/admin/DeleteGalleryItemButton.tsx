"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteGalleryItem } from "@/app/admin/actions/gallery";

export default function DeleteGalleryItemButton({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("למחוק פריט זה לצמיתות?")) return;
    startTransition(async () => {
      await deleteGalleryItem(itemId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center justify-center gap-1.5 text-xs text-stone-500 hover:text-red-600 border border-stone-200 hover:border-red-200 py-1.5 px-2.5 rounded-lg transition-colors disabled:opacity-40"
    >
      <Trash2 size={12} />
    </button>
  );
}
