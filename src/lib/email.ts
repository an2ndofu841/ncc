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
  passwordSetupUrl: string | null
) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ncc-chiro.or.jp").replace(/\/+$/, "");
  const loginUrl = `${siteUrl}/auth/login`;

  const passwordSection = passwordSetupUrl
    ? `
      <h3>■ STEP 1: パスワードの設定</h3>
      <p>まず、下記リンクからパスワードを設定してください。</p>
      <p><a href="${passwordSetupUrl}" style="display:inline-block;padding:12px 24px;background-color:#1a6d47;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">パスワードを設定する</a></p>
      <p style="font-size:12px;color:#666;">※ リンクの有効期限は72時間です。期限切れの場合はログイン画面の「パスワードを忘れた方」から再設定できます。</p>

      <h3>■ STEP 2: 入会金・年会費のお支払い</h3>
    `
    : `
      <h3>■ 入会金・年会費のお支払い</h3>
      <p>下記URLからログインしてください。</p>
      <p><a href="${loginUrl}">${loginUrl}</a></p>
    `;

  await sendEmail({
    to: email,
    subject: "【全日本カイロプラクティック施術協同組合】入会承認のお知らせ",
    html: `
      <p>${name} 様</p>
      <p>入会審査の結果、入会が承認されましたことをお知らせいたします。</p>
      <p><strong>ログイン用メールアドレス:</strong> ${email}</p>

      ${passwordSection}

      <p>パスワード設定（またはログイン）後、入会金・年会費の決済画面が表示されます。<br/>
      クレジットカードにて決済手続きをお願いいたします。</p>
      <p>決済完了後、会員専用サービス（セミナー申込み・書類ダウンロード等）を<br/>
      ご利用いただけるようになります。</p>

      <br/>
      <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
      <p>全日本カイロプラクティック施術協同組合<br/>事務局<br/>
      メール: info@ncc-chiro.or.jp</p>
    `,
  });
}

/**
 * 年会費更新案内メールを送信
 */
export async function sendRenewalReminderEmail(
  name: string,
  email: string,
  renewalDate: string,
  daysLeft: number
) {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.ncc-chiro.or.jp"
  ).replace(/\/+$/, "");
  const renewalUrl = `${siteUrl}/member/payment/renewal`;

  const urgency =
    daysLeft <= 0
      ? `<p style="color:#dc2626;font-weight:bold;">更新期限を過ぎています。速やかにお手続きをお願いいたします。</p>`
      : daysLeft <= 7
        ? `<p style="color:#d97706;font-weight:bold;">更新期限まであと${daysLeft}日です。お早めにお手続きください。</p>`
        : `<p>更新期限まであと<strong>${daysLeft}日</strong>です。</p>`;

  await sendEmail({
    to: email,
    subject: "【全日本カイロプラクティック施術協同組合】年会費更新のご案内",
    html: `
      <p>${name} 様</p>
      <p>日頃より当組合の活動にご理解ご協力を賜り、誠にありがとうございます。</p>
      <p>年会費の更新時期が近づいておりますので、ご案内申し上げます。</p>

      <h3>■ 更新日</h3>
      <p><strong>${renewalDate}</strong></p>
      ${urgency}

      <h3>■ お手続き方法</h3>
      <p>下記リンクからログインの上、年会費のお支払いをお願いいたします。<br/>
      クレジットカード、コンビニ払い、銀行振込、PayPayに対応しております。</p>
      <p>
        <a href="${renewalUrl}" style="display:inline-block;padding:12px 24px;background-color:#1a6d47;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">
          年会費を支払う
        </a>
      </p>

      <p style="font-size:12px;color:#666;">
        ※ クレジットカードで自動更新をご利用の方は、自動的に決済されますので本メールは無視していただいて結構です。
      </p>

      <br/>
      <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
      <p>全日本カイロプラクティック施術協同組合<br/>事務局<br/>
      メール: info@ncc-chiro.or.jp</p>
    `,
  });
}
