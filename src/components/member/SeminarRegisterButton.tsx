"use client";

import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SeminarRegisterButtonProps {
  seminarId: string;
  memberId: string;
  disabled: boolean;
  disabledReason?: string;
  alreadyRegistered: boolean;
}

export default function SeminarRegisterButton({
  seminarId,
  memberId,
  disabled,
  disabledReason,
  alreadyRegistered,
}: SeminarRegisterButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleRegister() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from("seminar_registrations")
        .insert({ seminar_id: seminarId, member_id: memberId });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("すでに申込済みです。");
        } else {
          setError(insertError.message);
        }
        return;
      }

      setDone(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (alreadyRegistered || done) {
    return (
      <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
        お申込み済みです。当日お待ちしております。
      </p>
    );
  }

  if (disabled) {
    return (
      <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        {disabledReason ?? "現在お申込みいただけません。"}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}
      <Button
        type="button"
        size="lg"
        loading={loading}
        onClick={handleRegister}
      >
        この研修・セミナーに申し込む
      </Button>
    </div>
  );
}
