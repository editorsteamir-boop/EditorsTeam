import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function useFontoAssets() {
  const [textBoxes, setTextBoxes] = useState([]);
  const [styles, setStyles] = useState([]);

  useEffect(() => {
    async function loadAssets() {
      const { data: boxes } = await supabase
        .from("fonto_text_boxes")
        .select("*");

      const { data: styleItems } = await supabase
        .from("fonto_styles")
        .select("*");

      setTextBoxes(boxes || []);
      setStyles(styleItems || []);
    }

    loadAssets();
  }, []);

  return { textBoxes, styles };
}
