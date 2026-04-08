"use client";

import { useCallback, useState } from "react";

interface PostalResult {
  address1: string; // 都道府県
  address2: string; // 市区町村
  address3: string; // 町域
}

export function usePostalCode() {
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (code: string): Promise<string | null> => {
    const normalized = code.replace(/[−ー\-\s]/g, "");
    if (!/^\d{7}$/.test(normalized)) return null;

    setLoading(true);
    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${normalized}`
      );
      const json = await res.json();
      if (!json.results || json.results.length === 0) return null;

      const r: PostalResult = json.results[0];
      return `${r.address1}${r.address2}${r.address3}`;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { lookup, loading };
}
