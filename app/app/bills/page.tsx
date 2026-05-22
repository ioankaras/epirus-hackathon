"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBankContext } from "@/components/providers/BankProvider";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { formatCurrency } from "@/lib/utils";
import { BarcodeDetector } from "barcode-detector";
import { useRouter } from "next/navigation";
import { Bill } from "@/lib/types";

export default function BillsPage() {
  const { refreshAccount, refreshBills, refreshTransactions } =
    useBankContext();
  const [rfCode, setRfCode] = useState("");
  const [showRfInput, setShowRfInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const router = useRouter();

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function handleScan() {
    setScanError(null);

    if (!("BarcodeDetector" in window)) {
      setScanError("Barcode scanning is not supported in this browser.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
    } catch {
      setScanError("Camera access denied. Please allow camera permissions.");
      return;
    }

    streamRef.current = stream;
    setScanning(true);

    // Wait for the video element to mount
    await new Promise<void>((res) => setTimeout(res, 100));

    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    await video.play();

    const detector = new BarcodeDetector({ formats: ["code_128", "qr_code", "ean_13", "pdf417"] });

    const detect = async () => {
      if (!videoRef.current) return;
      try {
        const codes: { rawValue: string }[] = await detector.detect(videoRef.current);
        const match = codes[0];
        if (match) {
          const detected = match.rawValue;
          stopCamera();
          setScanning(false);

          const billResponse = await (await fetch("/api/bills")).json()

          if (!billResponse.bills.some((b: Bill) => b.rf === detected)) {
            setFeedback({
              type: "error",
              title: "Scan Failed",
              message: "Invalid RF Code",
            });
            return
          }

          router.push(`/bills/pay?code=${encodeURIComponent(detected)}`);
          return;
        }
      } catch {
        // frame not ready yet — keep scanning
      }
      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
  }

  async function handleRfPay() {
    if (!rfCode.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfCode: rfCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([refreshAccount(), refreshBills(), refreshTransactions()]);
        setFeedback({
          type: "success",
          title: "Bill Paid!",
          message: data.amount
            ? `${formatCurrency(data.amount)} paid successfully`
            : "Payment successful",
        });
        setRfCode("");
        setShowRfInput(false);
      } else {
        setFeedback({
          type: "error",
          title: "Payment Failed",
          message: data.error || "Please try again",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        title: "Connection error",
        message: "Please check your connection and try again",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[80vh]">
      <PageHeader title="Scan Bill" />

      <div className="flex flex-col items-center justify-center flex-1 px-6 gap-6">
        {/* Scan button */}
        <button onClick={handleScan} className="flex flex-col items-center justify-center w-48 h-48 rounded-3xl bg-action-blue text-white shadow-lg active:bg-action-blue-hover focus:outline-none focus:ring-4 focus:ring-action-blue/40 gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-16 h-16"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
          <span className="text-lg font-semibold">Scan to Pay</span>
        </button>

        {scanError && (
          <p className="text-accent-red text-sm text-center max-w-xs">{scanError}</p>
        )}

        {/* RF code entry */}
        {!showRfInput ? (
          <button
            onClick={() => setShowRfInput(true)}
            className="text-text-secondary text-base underline underline-offset-4 focus:outline-none"
          >
            Enter RF code manually
          </button>
        ) : (
          <div className="w-full max-w-sm flex flex-col gap-3">
            <input
              type="text"
              value={rfCode}
              onChange={(e) => setRfCode(e.target.value)}
              placeholder="Enter code"
              className="w-full min-h-[56px] px-4 rounded-xl border-2 border-border bg-surface text-primary-navy text-lg font-mono focus:outline-none focus:ring-4 focus:ring-action-blue/40 placeholder:text-text-secondary/50"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRfInput(false);
                  setRfCode("");
                }}
              >
                Cancel
              </Button>
              <Button
                loading={submitting}
                disabled={!rfCode.trim()}
                onClick={handleRfPay}
              >
                Pay
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Camera overlay */}
      {scanning && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <video
            ref={videoRef}
            className="flex-1 w-full object-cover"
            playsInline
            muted
          />
          <div className="flex flex-col items-center gap-2 p-6 bg-black">
            <p className="text-white text-base">Point at a barcode or QR code</p>
            <button
              onClick={() => {
                stopCamera();
                setScanning(false);
              }}
              className="text-white/60 text-sm underline underline-offset-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <FeedbackModal
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  );
}
