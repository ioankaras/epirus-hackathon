"use client";

import { useEffect } from "react";
import { getDeviceId, patchGlobalFetch } from "@/lib/device-id";

export default function DeviceIdRegistrar() {
  useEffect(() => {
    patchGlobalFetch();
    getDeviceId();
  }, []);

  return null;
}
