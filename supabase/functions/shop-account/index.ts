import { guard, check, cors, json, text } from "../_shared/panel.ts";
import {
  shopAddressInput,
  shopEnquiryInput,
  mayCancelShopOrder,
} from "../_shared/shop-model.ts";
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { db, user } = await guard(req),
      uid = user.id,
      b = await req.json();
    const owned = async (table: string, id: string) => {
      const { data } = check(
        await db
          .from(table)
          .select("*")
          .eq("user_id", uid)
          .eq("id", id)
          .single(),
      );
      return data;
    };
    if (b.action === "profile-get") {
      const { data } = check(
        await db
          .from("shop_profiles")
          .select("data")
          .eq("user_id", uid)
          .maybeSingle(),
      );
      return json({ ...data?.data, email: user.email || "" });
    }
    if (b.action === "profile-save") {
      const input = b.profile || {};
      const fields = {
        name: 150,
        company: 180,
        nationalId: 25,
        economicCode: 30,
        registrationNumber: 30,
        postalCode: 20,
        address: 450,
      } as const;
      const data = {
        kind: input.kind === "company" ? "company" : "personal",
        ...Object.fromEntries(
          Object.entries(fields).map(([key, length]) => [
            key,
            text(input[key], length),
          ]),
        ),
      };
      check(await db.from("shop_profiles").upsert({ user_id: uid, data }));
      return json({ ...data, email: user.email || "" });
    }
    if (b.action === "snapshot") {
      const documents =
        check(
          await db
            .from("shop_documents")
            .select("id,kind,created_at,document")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(200),
        ).data || [];
      const orders =
        check(
          await db
            .from("shop_orders")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(200),
        ).data || [];
      const addresses =
        check(
          await db
            .from("shop_addresses")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false }),
        ).data || [];
      const saved =
        check(
          await db
            .from("shop_favorites")
            .select("product_id")
            .eq("user_id", uid),
        ).data || [];
      const products = saved.length
        ? check(
            await db
              .from("shop_products")
              .select("id,name_fa,name_en")
              .in(
                "id",
                saved.map((v) => v.product_id),
              ),
          ).data || []
        : [];
      return json({
        documents: documents.map((v) => ({
          id: v.id,
          kind: v.kind,
          createdAt: v.created_at,
          invoice: v.document.invoice,
          retail: v.document.retail,
        })),
        orders: orders.map((v) => ({
          id: v.id,
          number: v.number,
          status: v.status,
          createdAt: v.created_at,
          description: v.description,
          quantity: v.quantity,
          totalToman: v.total_toman === null ? null : Number(v.total_toman),
          tracking: v.tracking,
          address: v.address,
        })),
        addresses: addresses.map((v) => ({ ...v.data, id: v.id })),
        favorites: products.map((v) => ({
          id: v.id,
          nameFa: v.name_fa,
          nameEn: v.name_en,
        })),
      });
    }
    if (b.action === "address-save") {
      const data = shopAddressInput(b.address);
      if (b.id) {
        await owned("shop_addresses", text(b.id, 80));
        check(
          await db
            .from("shop_addresses")
            .update({ data })
            .eq("user_id", uid)
            .eq("id", b.id),
        );
      } else {
        const existing =
          check(await db.from("shop_addresses").select("id").eq("user_id", uid))
            .data || [];
        if (existing.length >= 20) throw Error("Address limit reached");
        check(await db.from("shop_addresses").insert({ user_id: uid, data }));
      }
      return json({ ok: true });
    }
    if (b.action === "address-delete") {
      await owned("shop_addresses", text(b.id, 80));
      check(
        await db
          .from("shop_addresses")
          .delete()
          .eq("user_id", uid)
          .eq("id", b.id),
      );
      return json({ ok: true });
    }
    if (b.action === "enquiry-create") {
      const input = shopEnquiryInput(b);
      const address = input.addressId
        ? (await owned("shop_addresses", input.addressId)).data
        : null;
      // A request only: client price, status, tracking and wallet fields are never accepted.
      const { data } = check(
        await db
          .from("shop_orders")
          .insert({
            user_id: uid,
            description: input.description,
            quantity: input.quantity,
            address,
            status: "requested",
            total_toman: null,
          })
          .select("id,number")
          .single(),
      );
      return json({ id: data.id, number: data.number });
    }
    if (b.action === "enquiry-cancel") {
      const order = await owned("shop_orders", text(b.id, 80));
      if (!mayCancelShopOrder(order.status))
        throw Error("This request cannot be cancelled here");
      const { data } = check(
        await db
          .from("shop_orders")
          .update({ status: "cancelled" })
          .eq("user_id", uid)
          .eq("id", order.id)
          .eq("status", "requested")
          .select("id")
          .single(),
      );
      return json({ ok: !!data });
    }
    if (b.action === "favorite-remove") {
      check(
        await db
          .from("shop_favorites")
          .delete()
          .eq("user_id", uid)
          .eq("product_id", text(b.productId, 200)),
      );
      return json({ ok: true });
    }
    if (b.action === "favorite-add") {
      const product = check(
        await db
          .from("shop_products")
          .select("id")
          .eq("id", text(b.productId, 200))
          .eq("active", true)
          .not("verified_at", "is", null)
          .single(),
      ).data;
      check(
        await db
          .from("shop_favorites")
          .upsert({ user_id: uid, product_id: product.id }),
      );
      return json({ ok: true });
    }
    throw Error("Unsupported store account action");
  } catch (error) {
    return json({ error: (error as Error).message }, 400);
  }
});
