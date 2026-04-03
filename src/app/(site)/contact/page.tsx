"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { CONTACT_CATEGORY_LABELS } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const categoryEnum = z.enum([
  "general",
  "membership",
  "seminar",
  "complaint",
  "other",
]);

const contactFormSchema = z.object({
  name: z.string().min(1, "お名前を入力してください。"),
  email: z.string().email("有効なメールアドレスを入力してください。"),
  phone: z.string().optional(),
  category: categoryEnum,
  message: z.string().min(1, "お問い合わせ内容を入力してください。"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "お問い合わせ | 全日本カイロプラクティック施術協同組合";
  }, []);

  const categoryOptions = useMemo(
    () =>
      (Object.keys(CONTACT_CATEGORY_LABELS) as (keyof typeof CONTACT_CATEGORY_LABELS)[]).map(
        (value) => ({
          value,
          label: CONTACT_CATEGORY_LABELS[value],
        })
      ),
    []
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      category: "general",
      phone: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone?.trim() || null,
          category: data.category,
          message: data.message,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setErrorMessage(json.error ?? "送信に失敗しました。");
        return;
      }
      setStatus("success");
      reset({
        category: "general",
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch {
      setStatus("error");
      setErrorMessage("通信エラーが発生しました。");
    }
  }

  return (
    <>
      <PageHeader
        title="お問い合わせ"
        description="ご質問・ご相談は下記フォームよりお送りください。"
        breadcrumbs={[{ label: "お問い合わせ" }]}
      />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          {status === "success" ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <svg
                  className="h-6 w-6"
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
                送信が完了しました
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                内容を確認のうえ、担当より折り返しご連絡いたします。
              </p>
              <Button
                type="button"
                className="mt-6"
                variant="outline"
                onClick={() => setStatus("idle")}
              >
                続けて送信する
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {status === "error" && errorMessage && (
                <div
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <Input
                id="contact-name"
                label="お名前"
                required
                autoComplete="name"
                {...register("name")}
                error={errors.name?.message}
              />

              <Input
                id="contact-email"
                type="email"
                label="メールアドレス"
                required
                autoComplete="email"
                {...register("email")}
                error={errors.email?.message}
              />

              <Input
                id="contact-phone"
                type="tel"
                label="電話番号"
                autoComplete="tel"
                {...register("phone")}
                error={errors.phone?.message}
                helperText="任意です。急ぎのご用件の際にご入力ください。"
              />

              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    id="contact-category"
                    label="お問い合わせ種別"
                    required
                    options={categoryOptions}
                    {...field}
                    error={errors.category?.message}
                  />
                )}
              />

              <Textarea
                id="contact-message"
                label="お問い合わせ内容"
                required
                rows={6}
                {...register("message")}
                error={errors.message?.message}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" size="lg" loading={status === "loading"}>
                  送信する
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}
