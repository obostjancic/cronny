import { useCallback } from "react";

const useOpenJSONInNewTab = () => {
  const openJsonInNewTab = useCallback((jsonData: unknown) => {
    const jsonString = JSON.stringify(jsonData, null, 2);

    const jsonBlob = new Blob([jsonString], { type: "application/json" });

    const jsonUrl = URL.createObjectURL(jsonBlob);

    window.open(jsonUrl, "_blank");

    setTimeout(() => URL.revokeObjectURL(jsonUrl), 1000);
  }, []);

  return openJsonInNewTab;
};

export default useOpenJSONInNewTab;
