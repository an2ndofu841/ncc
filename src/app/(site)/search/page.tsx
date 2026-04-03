"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { PREFECTURES, MEMBER_TYPE_LABELS } from "@/lib/utils";
import type { Member } from "@/lib/types";
import { MapPin, Phone, Clock, Search } from "lucide-react";

export default function SearchPage() {
  const [results, setResults] = useState<Member[]>([]);
  const [keyword, setKeyword] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    const supabase = createClient();
    let query = supabase
      .from("members")
      .select("*")
      .eq("is_public", true)
      .eq("status", "active")
      .order("clinic_name");

    if (prefecture) {
      query = query.eq("prefecture", prefecture);
    }
    if (keyword) {
      query = query.or(
        `clinic_name.ilike.%${keyword}%,name.ilike.%${keyword}%`
      );
    }

    const { data } = await query.limit(50);
    setResults((data ?? []) as Member[]);
    setLoading(false);
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader
        title="加盟院・会員検索"
        description="お近くのカイロプラクティック加盟院をお探しいただけます"
        breadcrumbs={[{ label: "加盟院検索" }]}
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="キーワード"
                placeholder="院名・会員名で検索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="都道府県"
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                options={[
                  { value: "", label: "すべて" },
                  ...PREFECTURES.map((p) => ({ value: p, label: p })),
                ]}
              />
            </div>
            <Button onClick={handleSearch} loading={loading} className="shrink-0">
              <Search className="mr-2 h-4 w-4" />
              検索
            </Button>
          </div>
        </Card>

        {searched && (
          <p className="mb-4 text-sm text-neutral-500">
            {results.length}件の加盟院が見つかりました
          </p>
        )}

        {results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((member) => (
              <Card key={member.id}>
                <h3 className="font-bold text-neutral-800 text-lg">
                  {member.clinic_name || member.name}
                </h3>
                {member.clinic_name && (
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {member.name}
                  </p>
                )}
                <span className="mt-2 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {MEMBER_TYPE_LABELS[member.member_type] ?? member.member_type}
                </span>

                <div className="mt-4 space-y-2 text-sm text-neutral-600">
                  {member.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-neutral-400" />
                      <span>{member.address}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-neutral-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.business_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-neutral-400" />
                      <span>{member.business_hours}</span>
                    </div>
                  )}
                </div>

                {member.description && (
                  <p className="mt-3 text-sm text-neutral-500 leading-relaxed line-clamp-3">
                    {member.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          searched &&
          !loading && (
            <div className="text-center py-16 text-neutral-500">
              <Search className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
              <p>条件に一致する加盟院が見つかりませんでした。</p>
              <p className="text-sm mt-1">検索条件を変更してお試しください。</p>
            </div>
          )
        )}
      </section>
    </>
  );
}
