"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import type { MemberType } from "@/lib/types";
import { MEMBER_TYPE_LABELS } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const memberTypeEnum = z.enum([
  "regular",
  "associate",
  "student",
  "supporting",
  "honorary",
] as const satisfies readonly MemberType[]);

const genderEnum = z.enum(["male", "female", "other", "no_answer"]);

const QUALIFICATION_GROUPS = [
  {
    label: "国家資格",
    options: [
      "柔道整復師",
      "あん摩マッサージ指圧師",
      "鍼灸師（はり師・きゅう師）",
      "理学療法士",
    ],
  },
  {
    label: "民間資格・認定",
    options: [
      "カイロプラクティック（民間認定資格）",
      "整体師（民間認定資格）",
    ],
  },
  {
    label: "その他",
    options: [
      "その他",
      "未経験（資格なし）",
    ],
  },
] as const;

const QUALIFICATION_OPTIONS = QUALIFICATION_GROUPS.flatMap((g) => g.options);

const formSchema = z.object({
  name: z.string().min(1, "氏名を入力してください。"),
  name_kana: z.string().min(1, "ふりがなを入力してください。"),
  birth_date: z.string().min(1, "生年月日を選択してください。"),
  gender: genderEnum,
  postal_code: z
    .string()
    .min(1, "郵便番号を入力してください。")
    .regex(/^\d{3}-?\d{4}$/, "ハイフンあり7桁の郵便番号で入力してください。"),
  address: z.string().min(1, "住所を入力してください。"),
  phone: z.string().min(1, "電話番号を入力してください。"),
  email: z.string().email("有効なメールアドレスを入力してください。"),
  clinic_name: z.string().optional(),
  qualifications: z
    .array(z.string())
    .min(1, "保有資格を1つ以上選択してください。"),
  qualifications_other: z.string().optional(),
  practice_years: z
    .string()
    .optional()
    .refine(
      (s) => {
        if (!s || s.trim() === "") return true;
        const n = parseInt(s, 10);
        return !Number.isNaN(n) && n >= 0 && n <= 80;
      },
      { message: "施術歴は0〜80の範囲で入力してください。" }
    ),
  desired_member_type: memberTypeEnum,
  has_referrer: z.boolean(),
  referrer_name: z.string().optional(),
  remarks: z.string().optional(),
  agreed_to_terms: z.boolean().refine((v) => v === true, {
    message: "利用規約に同意してください。",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const GENDER_LABELS: Record<z.infer<typeof genderEnum>, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
  no_answer: "無回答",
};

function genderToDb(g: z.infer<typeof genderEnum>): string {
  return GENDER_LABELS[g];
}

function parsePracticeYears(s: string | undefined): number | null {
  if (!s || s.trim() === "") return null;
  const n = parseInt(s, 10);
  if (Number.isNaN(n) || n < 0 || n > 80) return null;
  return n;
}

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "confirm" | "done">("form");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "会員申込み | 全日本カイロプラクティック施術協同組合";
  }, []);

  const memberTypeOptions = useMemo(
    () =>
      (Object.keys(MEMBER_TYPE_LABELS) as MemberType[]).map((value) => ({
        value,
        label: MEMBER_TYPE_LABELS[value] ?? value,
      })),
    []
  );

  const genderOptions = useMemo(
    () =>
      (Object.keys(GENDER_LABELS) as (keyof typeof GENDER_LABELS)[]).map(
        (value) => ({
          value,
          label: GENDER_LABELS[value],
        })
      ),
    []
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agreed_to_terms: false,
      practice_years: "",
      remarks: "",
      gender: undefined,
      desired_member_type: undefined,
      qualifications: [],
      qualifications_other: "",
      has_referrer: false,
      referrer_name: "",
      clinic_name: "",
    },
  });

  const hasReferrer = watch("has_referrer");
  const selectedQualifications = watch("qualifications");

  const onConfirm = handleSubmit(() => {
    setSubmitError(null);
    setStep("confirm");
  });

  async function onFinalSubmit() {
    const v = getValues();
    const py = parsePracticeYears(v.practice_years);
    if (v.practice_years && v.practice_years.trim() !== "" && py === null) {
      setSubmitError("施術歴は0〜80年の範囲で入力するか、空欄にしてください。");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const quals = [...v.qualifications];
      if (quals.includes("その他") && v.qualifications_other?.trim()) {
        const idx = quals.indexOf("その他");
        quals[idx] = `その他（${v.qualifications_other.trim()}）`;
      }
      const qualificationsStr = quals.join("、");

      const payload = {
        name: v.name,
        name_kana: v.name_kana,
        birth_date: v.birth_date,
        gender: genderToDb(v.gender),
        postal_code: v.postal_code.replace(/-/g, ""),
        address: v.address,
        phone: v.phone,
        email: v.email,
        clinic_name: v.clinic_name?.trim() || null,
        qualifications: qualificationsStr,
        practice_years: py,
        desired_member_type: v.desired_member_type,
        referrer_name: v.has_referrer && v.referrer_name?.trim() ? v.referrer_name.trim() : null,
        remarks: v.remarks?.trim() ? v.remarks : null,
        agreed_to_terms: true as const,
      };

      const formData = new FormData();
      formData.set("payload", JSON.stringify(payload));
      if (attachment) {
        formData.set("attachment", attachment);
      }

      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setSubmitError(data.error ?? "送信に失敗しました。");
        return;
      }
      setStep("done");
    } catch {
      setSubmitError("通信エラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <>
        <PageHeader
          title="会員申込み"
          description="お申込みありがとうございました。"
          breadcrumbs={[{ label: "会員申込み" }]}
        />
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-neutral-900">
                申込みを受け付けました
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                内容を確認のうえ、担当よりメールにてご連絡いたします。しばらくお待ちください。
              </p>
              <Button
                type="button"
                className="mt-8"
                variant="primary"
                onClick={() => router.push("/")}
              >
                トップページへ
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  if (step === "confirm") {
    const v = getValues();
    const py = parsePracticeYears(v.practice_years);
    return (
      <>
        <PageHeader
          title="会員申込み"
          description="入力内容をご確認のうえ、送信してください。"
          breadcrumbs={[{ label: "会員申込み" }]}
        />
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Card>
            <h2 className="mb-6 text-lg font-semibold text-primary-700">
              入力内容の確認
            </h2>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="font-medium text-neutral-500">氏名</dt>
                <dd className="mt-0.5 text-neutral-900">{v.name}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-neutral-500">ふりがな</dt>
                <dd className="mt-0.5 text-neutral-900">{v.name_kana}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">生年月日</dt>
                <dd className="mt-0.5 text-neutral-900">{v.birth_date}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">性別</dt>
                <dd className="mt-0.5 text-neutral-900">
                  {GENDER_LABELS[v.gender]}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">郵便番号</dt>
                <dd className="mt-0.5 text-neutral-900">{v.postal_code}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-neutral-500">住所</dt>
                <dd className="mt-0.5 text-neutral-900">{v.address}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">電話番号</dt>
                <dd className="mt-0.5 text-neutral-900">{v.phone}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">メールアドレス</dt>
                <dd className="mt-0.5 break-all text-neutral-900">{v.email}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-neutral-500">所属院名／屋号</dt>
                <dd className="mt-0.5 text-neutral-900">
                  {v.clinic_name?.trim() || "（なし）"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-neutral-500">保有資格</dt>
                <dd className="mt-0.5 text-neutral-900">
                  {(() => {
                    const quals = [...v.qualifications];
                    if (quals.includes("その他") && v.qualifications_other?.trim()) {
                      const idx = quals.indexOf("その他");
                      quals[idx] = `その他（${v.qualifications_other.trim()}）`;
                    }
                    return quals.join("、");
                  })()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">施術歴（年）</dt>
                <dd className="mt-0.5 text-neutral-900">
                  {py !== null ? `${py}年` : "（未入力）"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">希望会員種別</dt>
                <dd className="mt-0.5 text-neutral-900">
                  {MEMBER_TYPE_LABELS[v.desired_member_type]}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-neutral-500">紹介者</dt>
                <dd className="mt-0.5 text-neutral-900">
                  {v.has_referrer && v.referrer_name?.trim()
                    ? v.referrer_name.trim()
                    : "（なし）"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-neutral-500">備考</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-neutral-900">
                  {v.remarks?.trim() ? v.remarks : "（なし）"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-neutral-500">添付書類</dt>
                <dd className="mt-0.5 text-neutral-900">
                  {attachment ? attachment.name : "（なし）"}
                </dd>
              </div>
            </dl>

            {submitError && (
              <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {submitError}
              </p>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("form")}
                disabled={submitting}
              >
                修正する
              </Button>
              <Button
                type="button"
                loading={submitting}
                onClick={() => void onFinalSubmit()}
              >
                送信する
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="会員申込み"
        description="必要事項をご入力のうえ、お申し込みください。"
        breadcrumbs={[{ label: "会員申込み" }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <form onSubmit={onConfirm} className="space-y-10">
          <Card>
            <h2 className="mb-6 border-b border-neutral-100 pb-3 text-lg font-semibold text-primary-700">
              基本情報
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  id="name"
                  label="氏名"
                  required
                  {...register("name")}
                  error={errors.name?.message}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  id="name_kana"
                  label="ふりがな"
                  required
                  {...register("name_kana")}
                  error={errors.name_kana?.message}
                />
              </div>
              <Input
                id="birth_date"
                type="date"
                label="生年月日"
                required
                {...register("birth_date")}
                error={errors.birth_date?.message}
              />
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    id="gender"
                    label="性別"
                    required
                    placeholder="選択してください"
                    options={genderOptions}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    ref={field.ref}
                    value={field.value ?? ""}
                    error={errors.gender?.message}
                  />
                )}
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-6 border-b border-neutral-100 pb-3 text-lg font-semibold text-primary-700">
              連絡先
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="postal_code"
                label="郵便番号"
                placeholder="123-4567"
                required
                {...register("postal_code")}
                error={errors.postal_code?.message}
                helperText="ハイフンあり・なしどちらでも可です。"
              />
              <div className="hidden sm:block" />
              <div className="sm:col-span-2">
                <Input
                  id="address"
                  label="住所"
                  required
                  {...register("address")}
                  error={errors.address?.message}
                />
              </div>
              <Input
                id="phone"
                type="tel"
                label="電話番号"
                required
                {...register("phone")}
                error={errors.phone?.message}
              />
              <Input
                id="email"
                type="email"
                label="メールアドレス"
                required
                autoComplete="email"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-6 border-b border-neutral-100 pb-3 text-lg font-semibold text-primary-700">
              所属・資格
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  id="clinic_name"
                  label="所属院名／屋号"
                  {...register("clinic_name")}
                  error={errors.clinic_name?.message}
                  helperText="所属がない場合は空欄で構いません。"
                />
              </div>
              <div className="sm:col-span-2">
                <fieldset>
                  <legend className="mb-1.5 text-sm font-medium text-neutral-700">
                    保有資格 <span className="text-red-500">*</span>
                  </legend>
                  <p className="mb-3 text-xs text-neutral-500">
                    該当するものをすべて選択してください。
                  </p>
                  <div className="space-y-4">
                    {QUALIFICATION_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="mb-1.5 text-xs font-semibold text-neutral-500">
                          {group.label}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {group.options.map((q) => (
                            <label
                              key={q}
                              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm transition-colors hover:bg-neutral-50"
                            >
                              <input
                                type="checkbox"
                                value={q}
                                {...register("qualifications")}
                                className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                              />
                              <span className="text-neutral-700">{q}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedQualifications?.includes("その他") && (
                    <div className="mt-2">
                      <Input
                        id="qualifications_other"
                        placeholder="資格名を入力"
                        {...register("qualifications_other")}
                      />
                    </div>
                  )}
                  {errors.qualifications?.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.qualifications.message}
                    </p>
                  )}
                </fieldset>
              </div>
              <Input
                id="practice_years"
                type="number"
                inputMode="numeric"
                min={0}
                max={80}
                label="施術歴（年）"
                {...register("practice_years")}
                error={errors.practice_years?.message}
                helperText="未経験の場合は空欄で構いません（0〜80）。"
              />
              <Controller
                name="desired_member_type"
                control={control}
                render={({ field }) => (
                  <Select
                    id="desired_member_type"
                    label="希望会員種別"
                    required
                    placeholder="選択してください"
                    options={memberTypeOptions}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    ref={field.ref}
                    value={field.value ?? ""}
                    error={errors.desired_member_type?.message}
                  />
                )}
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-6 border-b border-neutral-100 pb-3 text-lg font-semibold text-primary-700">
              紹介者
            </h2>
            <div className="space-y-4">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-neutral-700">
                  紹介者の有無
                </legend>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition-colors hover:bg-neutral-50">
                    <input
                      type="radio"
                      value="false"
                      checked={!hasReferrer}
                      onChange={() => {
                        const { onChange } = register("has_referrer");
                        onChange({ target: { name: "has_referrer", value: false } });
                      }}
                      className="h-4 w-4 border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span className="text-neutral-700">なし</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition-colors hover:bg-neutral-50">
                    <input
                      type="radio"
                      value="true"
                      checked={hasReferrer}
                      onChange={() => {
                        const { onChange } = register("has_referrer");
                        onChange({ target: { name: "has_referrer", value: true } });
                      }}
                      className="h-4 w-4 border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span className="text-neutral-700">あり</span>
                  </label>
                </div>
              </fieldset>
              {hasReferrer && (
                <Input
                  id="referrer_name"
                  label="紹介者氏名"
                  required
                  placeholder="紹介者のお名前を入力してください"
                  {...register("referrer_name")}
                  error={errors.referrer_name?.message}
                />
              )}
            </div>
          </Card>

          <Card>
            <h2 className="mb-6 border-b border-neutral-100 pb-3 text-lg font-semibold text-primary-700">
              その他
            </h2>
            <div className="space-y-5">
              <Textarea
                id="remarks"
                label="備考欄"
                rows={4}
                {...register("remarks")}
                error={errors.remarks?.message}
              />
              <div>
                <label
                  htmlFor="attachment"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  添付書類
                </label>
                <input
                  id="attachment"
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
                  onChange={(e) =>
                    setAttachment(e.target.files?.[0] ?? null)
                  }
                />
                <p className="mt-1 text-sm text-neutral-500">
                  PDF、JPEG、PNG、WebP（10MBまで）。任意です。
                </p>
              </div>
              <div>
                <Controller
                  name="agreed_to_terms"
                  control={control}
                  render={({ field: { value, onChange, ref } }) => (
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50">
                      <input
                        ref={ref}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-neutral-700">
                        <span className="font-medium text-red-500">*</span>
                        利用規約および個人情報の取り扱いに同意します。
                      </span>
                    </label>
                  )}
                />
                {errors.agreed_to_terms?.message && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.agreed_to_terms.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-neutral-500">
                  詳細は{" "}
                  <Link href="/" className="text-primary underline">
                    利用規約
                  </Link>
                  をご確認ください（ページ整備中の場合は後日ご案内いたします）。
                </p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              入力内容を確認する
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
