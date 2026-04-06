/**
 * メール送信ユーティリティ
 *
 * Supabase Edge Functions または外部メールサービス(Resend等)との
 * 連携を想定したメール送信の抽象レイヤー。
 * 環境変数 RESEND_API_KEY が設定されている場合は Resend API を使用し、
 * 未設定の場合はコンソールにログ出力する（開発用）。
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "noreply@chiropractic-coop.jp";
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "info@ncc-chiro.or.jp";

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[EMAIL-DEV]", JSON.stringify(payload, null, 2));
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[EMAIL-ERROR]", err);
    return false;
  }
}

export async function sendApplicationConfirmation(
  name: string,
  email: string
) {
  await sendEmail({
    to: email,
    subject: "【全日本カイロプラクティック施術協同組合】入会申込みを受け付けました",
    html: `
      <p>${name} 様</p>
      <p>このたびは入会申込みをいただき、誠にありがとうございます。</p>
      <p>お申込み内容を確認の上、事務局よりご連絡いたします。<br/>
      審査には通常1〜2週間程度お時間をいただいております。</p>
      <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
      <br/>
      <p>全日本カイロプラクティック施術協同組合<br/>事務局</p>
    `,
  });
}

export async function sendApplicationNotificationToAdmin(
  name: string,
  email: string
) {
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `【管理】新規入会申込み: ${name}`,
    html: `
      <p>新規入会申込みがありました。</p>
      <p><strong>氏名:</strong> ${name}<br/>
      <strong>メールアドレス:</strong> ${email}</p>
      <p>管理画面で詳細を確認してください。</p>
    `,
  });
}

export async function sendContactConfirmation(
  name: string,
  email: string
) {
  await sendEmail({
    to: email,
    subject: "【全日本カイロプラクティック施術協同組合】お問い合わせを受け付けました",
    html: `
      <p>${name} 様</p>
      <p>お問い合わせいただき、ありがとうございます。</p>
      <p>内容を確認の上、担当者よりご連絡いたします。<br/>
      通常2〜3営業日以内にご返信いたします。</p>
      <br/>
      <p>全日本カイロプラクティック施術協同組合<br/>事務局</p>
    `,
  });
}

export async function sendContactNotificationToAdmin(
  name: string,
  email: string,
  category: string
) {
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `【管理】新規お問い合わせ: ${name} (${category})`,
    html: `
      <p>新規お問い合わせがありました。</p>
      <p><strong>氏名:</strong> ${name}<br/>
      <strong>メールアドレス:</strong> ${email}<br/>
      <strong>種別:</strong> ${category}</p>
      <p>管理画面で詳細を確認してください。</p>
    `,
  });
}

export async function sendSeminarRegistrationConfirmation(
  name: string,
  email: string,
  seminarTitle: string,
  seminarDate: string
) {
  await sendEmail({
    to: email,
    subject: `【全日本カイロプラクティック施術協同組合】セミナー申込み完了: ${seminarTitle}`,
    html: `
      <p>${name} 様</p>
      <p>以下のセミナーへのお申込みを受け付けました。</p>
      <p><strong>セミナー名:</strong> ${seminarTitle}<br/>
      <strong>開催日:</strong> ${seminarDate}</p>
      <p>詳細はマイページからご確認いただけます。</p>
      <br/>
      <p>全日本カイロプラクティック施術協同組合<br/>事務局</p>
    `,
  });
}

export async function sendPasswordResetNotification(email: string) {
  await sendEmail({
    to: email,
    subject: "【全日本カイロプラクティック施術協同組合】パスワード再設定",
    html: `
      <p>パスワード再設定のリクエストを受け付けました。</p>
      <p>メールに記載されたリンクからパスワードを再設定してください。</p>
      <p>このリクエストに心当たりがない場合は、このメールを無視してください。</p>
      <br/>
      <p>全日本カイロプラクティック施術協同組合<br/>事務局</p>
    `,
  });
}

export async function sendMemberApprovalNotification(
  name: string,
  email: string,
  tempPassword: string | null
) {
  await sendEmail({
    to: email,
    subject: "【全日本カイロプラクティック施術協同組合】入会承認のお知らせ",
    html: `
      <p>${name} 様</p>
      <p>入会審査の結果、入会が承認されましたことをお知らせいたします。</p>
      <p>以下の情報で会員専用ページにログインできます。</p>
      <p><strong>メールアドレス:</strong> ${email}<br/>
      ${tempPassword ? `<strong>仮パスワード:</strong> ${tempPassword}<br/>` : ""}
      </p>
      ${tempPassword ? "<p>初回ログイン後、パスワードの変更をお願いいたします。</p>" : ""}
      <br/>
      <p>全日本カイロプラクティック施術協同組合<br/>事務局</p>
    `,
  });
}
