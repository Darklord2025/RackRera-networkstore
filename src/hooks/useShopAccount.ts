import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  blankShopSnapshot,
  shopAddressInput,
  shopEnquiryInput,
  mayCancelShopOrder,
  type ShopSnapshot,
} from "../../supabase/functions/_shared/shop-model";
const previewSnapshot = (): ShopSnapshot => ({
  addresses: [],
  favorites: [],
  orders: [
    {
      id: "preview-order",
      number: 10001,
      status: "requested",
      createdAt: new Date().toISOString(),
      description: "درخواست نمونه سوئیچ شبکه / Sample network switch enquiry",
      quantity: 1,
      totalToman: null,
    },
  ],
});
export function useShopAccount(preview: boolean) {
  const [data, setData] = useState<ShopSnapshot>(() =>
      preview ? previewSnapshot() : blankShopSnapshot,
    ),
    [ready, setReady] = useState(preview),
    [error, setError] = useState("");
  async function invoke(action: string, payload: Record<string, unknown> = {}) {
    if (!supabase) throw Error("Store account unavailable");
    const result = await supabase.functions.invoke("shop-account", {
      body: { action, ...payload },
    });
    if (result.error || result.data?.error)
      throw Error(
        result.data?.error ||
          "ارتباط با حساب فروشگاه برقرار نشد / Store account unavailable",
      );
    return result.data;
  }
  async function refresh() {
    if (preview) return;
    setError("");
    try {
      setData(await invoke("snapshot"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setReady(true);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function action(name: string, payload: Record<string, unknown>) {
    if (!preview) {
      const result = await invoke(name, payload);
      await refresh();
      return result;
    }
    if (name === "address-save") {
      const address = shopAddressInput(payload.address);
      setData((d) => ({
        ...d,
        addresses: payload.id
          ? d.addresses.map((v) =>
              v.id === payload.id ? { ...address, id: v.id } : v,
            )
          : [...d.addresses, { ...address, id: crypto.randomUUID() }],
      }));
    }
    if (name === "address-delete")
      setData((d) => ({
        ...d,
        addresses: d.addresses.filter((v) => v.id !== payload.id),
      }));
    if (name === "enquiry-create") {
      const input = shopEnquiryInput(payload);
      setData((d) => ({
        ...d,
        orders: [
          {
            id: crypto.randomUUID(),
            number: Math.max(10000, ...d.orders.map((v) => v.number)) + 1,
            status: "requested",
            createdAt: new Date().toISOString(),
            description: input.description,
            quantity: input.quantity,
            totalToman: null,
          },
          ...d.orders,
        ],
      }));
    }
    if (name === "enquiry-cancel") {
      const order = data.orders.find((v) => v.id === payload.id);
      if (!order || !mayCancelShopOrder(order.status))
        throw Error("Cannot cancel");
      setData((d) => ({
        ...d,
        orders: d.orders.map((v) =>
          v.id === payload.id ? { ...v, status: "cancelled" } : v,
        ),
      }));
    }
    if (name === "favorite-remove")
      setData((d) => ({
        ...d,
        favorites: d.favorites.filter((v) => v.id !== payload.productId),
      }));
    return { preview: true };
  }
  return { data, ready, error, refresh, action };
}
