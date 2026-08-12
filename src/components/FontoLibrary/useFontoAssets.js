import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function useFontoAssets() {
  const [quickStyles, setQuickStyles] = useState([]);
  const [textThemes, setTextThemes] = useState([]);

  useEffect(() => {
    async function loadAssets() {
      const [{ data: quickItems }, { data: themeItems }] = await Promise.all([
        supabase
        .from("fonto_quick_styles")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
        supabase
        .from("fonto_text_themes")
        .select("*")
        .eq("is_active", true)
        .eq("supports_fa", true)
        .eq("supports_en", true)
        .order("sort_order"),
      ]);

      setQuickStyles(quickItems || []);
      setTextThemes(themeItems || []);
    }

    loadAssets();
  }, []);

  return { quickStyles, textThemes };
}
