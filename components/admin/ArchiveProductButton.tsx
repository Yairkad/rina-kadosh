"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { archiveProduct } from "@/app/admin/actions/products";

export default function ArchiveProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleArchive() {
    if (!confirm("להעביר מוצר זה לארכיון?")) return;
    startTransition(async () => {
      await archiveProduct(productId);
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleArchive}
      disabled={isPending}
      className="flex items-center gap-2 text-sm text-stone-500 hover:text-red-600 border border-stone-200 hover:border-red-200 px-4 py-2 rounded-xl transition-colors"
    >
      <Archive size={15} />
      {isPending ? "מעביר לארכיון..." : "העבר לארכיון"}
    </button>
  );
}
