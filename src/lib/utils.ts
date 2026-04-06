import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "…";
}

export const MEMBER_TYPE_LABELS: Record<string, string> = {
  regular: "正会員",
  associate: "準会員",
  family: "家族会員",
  student: "学生会員",
  supporting: "賛助会員",
  honorary: "名誉会員",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  unreviewed: "未確認",
  reviewing: "確認中",
  awaiting_documents: "追加書類待ち",
  under_examination: "審査中",
  approved: "承認",
  rejected: "否認",
};

export const NEWS_CATEGORY_LABELS: Record<string, string> = {
  notice: "組合からのお知らせ",
  important: "重要なお知らせ",
  seminar_info: "研修・セミナー情報",
  member_only: "会員向けお知らせ",
};

export const CONTACT_CATEGORY_LABELS: Record<string, string> = {
  general: "一般的なお問い合わせ",
  membership: "入会に関するお問い合わせ",
  seminar: "研修・セミナーに関するお問い合わせ",
  complaint: "ご意見・ご要望",
  other: "その他",
};

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  active: "在籍中",
  inactive: "休止中",
  suspended: "停止中",
  withdrawn: "退会済み",
};

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

export const COLUMN_CATEGORY_LABELS: Record<string, string> = {
  general: "コラム",
  technique: "技術・施術",
  health: "健康情報",
  interview: "インタビュー",
  report: "活動レポート",
};
