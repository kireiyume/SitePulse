"use client";

import { useCallback, useState } from "react";

export function useSiteSelection(initialSiteId: string | null) {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(initialSiteId);
  const [isDetailOpen, setIsDetailOpen] = useState(Boolean(initialSiteId));

  const selectSite = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => setIsDetailOpen(false), []);

  return {
    selectedSiteId,
    isDetailOpen,
    selectSite,
    closeDetail,
  };
}
