import type { MemberType } from "@/lib/types";

interface PriceConfig {
  admission: string;
  certification?: string;
  annual: string;
}

interface LineItem {
  price: string;
  quantity: number;
}

const PRICE_MAP: Record<string, PriceConfig> = {
  regular: {
    admission: process.env.STRIPE_PRICE_ADMISSION_REGULAR ?? "",
    certification: process.env.STRIPE_PRICE_CERTIFICATION_REGULAR ?? "",
    annual: process.env.STRIPE_PRICE_ANNUAL_REGULAR ?? "",
  },
  associate: {
    admission: process.env.STRIPE_PRICE_ADMISSION_ASSOCIATE ?? "",
    annual: process.env.STRIPE_PRICE_ANNUAL_ASSOCIATE ?? "",
  },
  family: {
    admission: process.env.STRIPE_PRICE_ADMISSION_FAMILY ?? "",
    annual: process.env.STRIPE_PRICE_ANNUAL_FAMILY ?? "",
  },
  student: {
    admission: process.env.STRIPE_PRICE_ADMISSION_STUDENT ?? "",
    annual: process.env.STRIPE_PRICE_ANNUAL_STUDENT ?? "",
  },
};

export const FEE_TABLE: Record<
  string,
  { admission: number; certification: number; annual: number }
> = {
  regular: { admission: 100_000, certification: 50_000, annual: 30_000 },
  associate: { admission: 50_000, certification: 0, annual: 20_000 },
  family: { admission: 40_000, certification: 0, annual: 10_000 },
  student: { admission: 30_000, certification: 0, annual: 10_000 },
};

export function buildLineItems(memberType: MemberType): LineItem[] {
  const config = PRICE_MAP[memberType];
  if (!config) throw new Error(`Unknown member type: ${memberType}`);

  const items: LineItem[] = [];

  if (config.admission) {
    items.push({ price: config.admission, quantity: 1 });
  }

  if (config.certification) {
    items.push({ price: config.certification, quantity: 1 });
  }

  if (config.annual) {
    items.push({ price: config.annual, quantity: 1 });
  }

  if (items.length === 0) {
    throw new Error(`No Stripe prices configured for member type: ${memberType}`);
  }

  return items;
}
