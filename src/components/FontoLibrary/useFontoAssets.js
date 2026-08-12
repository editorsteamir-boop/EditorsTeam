import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function useFontoAssets() {
  const [styles, setStyles] = useState([]);

  useEffect(() => {
    async function loadAssets() {
      const { data: styleItems } = await supabase
        .from("fonto_styles")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      setStyles(styleItems || []);
    }

    loadAssets();
  }, []);

  return { styles };
}
