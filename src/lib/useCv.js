import { useEffect, useState } from "react";
import { profile } from "../data/profile";

export const cvUrl = `${import.meta.env.BASE_URL}${profile.cv}`;

// The CV button only shows once the PDF has actually been added to public/.
// (The dev server answers unknown paths with index.html, hence the content-type check.)
export const useCvAvailable = () => {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch(cvUrl, { method: "HEAD" })
      .then((res) => {
        const type = res.headers.get("content-type") || "";
        if (!cancelled) setAvailable(res.ok && type.includes("pdf"));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return available;
};
