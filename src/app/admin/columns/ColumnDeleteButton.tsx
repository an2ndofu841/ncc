"use client";

import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ColumnDeleteButton({
  columnId,
}: {
  columnId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("このコラム記事を削除しますか？取り消せません。")) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("columns").delete().eq("id", columnId);
    setLoading(false);
    if (error) {
      alert("削除に失敗しました: " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      loading={loading}
      onClick={handleDelete}
    >
      削除
    </Button>
  );
}
