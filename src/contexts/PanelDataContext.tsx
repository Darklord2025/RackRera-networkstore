import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { emptyProfile, type AccountProfile } from "@/lib/panel-model";
async function request(action: string, profile?: AccountProfile) {
  if (!supabase) throw Error("Store account unavailable");
  const { data, error } = await supabase.functions.invoke("shop-account", {
    body: { action, profile },
  });
  if (error || data?.error)
    throw Error(
      "دسترسی به مشخصات صورتحساب برقرار نشد / Billing profile unavailable",
    );
  return { ...emptyProfile, ...data } as AccountProfile;
}
const Context = createContext<null | {
  data: { profile: AccountProfile };
  ready: boolean;
  error: string;
  refresh: () => Promise<void>;
  saveProfile: (p: AccountProfile) => Promise<void>;
}>(null);
export const useOptionalPanelData = () => useContext(Context);
export const usePanelData = () => useContext(Context)!;
export function PanelDataProvider({
  children,
  preview = false,
}: {
  children: ReactNode;
  preview?: boolean;
}) {
  const [profile, set] = useState(emptyProfile),
    [ready, setReady] = useState(preview),
    [error, setError] = useState("");
  async function refresh() {
    if (preview) return;
    try {
      set(await request("profile-get"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setReady(true);
    }
  }
  async function saveProfile(p: AccountProfile) {
    set(preview ? p : await request("profile-save", p));
  }
  useEffect(() => {
    void refresh();
  }, [preview]);
  return (
    <Context.Provider
      value={{ data: { profile }, ready, error, refresh, saveProfile }}
    >
      {children}
    </Context.Provider>
  );
}
