"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBankContext } from "@/components/providers/BankProvider";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import FeedbackModal from "@/components/ui/FeedbackModal";

import { BarcodeDetector } from "barcode-detector";
import { useRouter } from "next/navigation";
import { Bill } from "@/lib/types";

export default function BillsPage() {
  useBankContext();
  const [rfCode, setRfCode] = useState("RF");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const [scanning, setScanning] = useState(false);
  const [showScanGuide, setShowScanGuide] = useState(false);
  const [showRfGuide, setShowRfGuide] = useState(false);
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
      setScanError("Το σκανάρισμα δεν υποστηρίζεται σε αυτόν τον browser.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
    } catch {
      setScanError("Η πρόσβαση στην κάμερα απορρίφθηκε. Επιτρέψτε την πρόσβαση στις ρυθμίσεις.");
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

          const billResponse: Bill[] = await (await fetch("/mock-api/bills")).json()

          if (!billResponse.some((b: Bill) => b.rf === detected)) {
            setFeedback({
              type: "error",
              title: "Αποτυχία σκαναρίσματος",
              message: "Μη έγκυρος κωδικός RF",
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
    const code = rfCode.trim();
    if (!code) return;
    setSubmitting(true);
    try {
      const billResponse: Bill[] = await (await fetch("/mock-api/bills")).json();
      if (!billResponse.some((b: Bill) => b.rf === code)) {
        setFeedback({
          type: "error",
          title: "Μη έγκυρος κωδικός",
          message: "Δεν βρέθηκε λογαριασμός για αυτόν τον κωδικό",
        });
        return;
      }
      router.push(`/bills/pay?code=${encodeURIComponent(code)}`);
    } catch {
      setFeedback({
        type: "error",
        title: "Σφάλμα σύνδεσης",
        message: "Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[80vh]">
      <PageHeader title="Πληρωμή Λογαριασμών" />

      <div className="flex flex-col items-center justify-center flex-1 px-6 gap-6 pt-6">
        <h1 className="text-2xl font-bold text-primary-navy self-start">Πληρωμή Λογαριασμού</h1>
        {/* Scan button */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold text-primary-navy mb-4 text-center">Σκανάρισμα  λογαριασμού</h2>
          <button onClick={handleScan} className="flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-gradient-brand text-white shadow-lg active:opacity-90 focus:outline-none focus:ring-4 focus:ring-action-blue/40 gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10"
            >
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="12" x2="17" y2="12" />
            </svg>
            <span className="text-lg font-semibold">Σκανάρισμα</span>
          </button>
          {scanError && (
            <p className="text-accent-red text-sm text-center max-w-xs">{scanError}</p>
          )}
          <button
            onClick={() => setShowScanGuide(true)}
            className="text-text-secondary text-md underline underline-offset-4 focus:outline-none"
          >
            Τι να σκανάρω;
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-sm">
          <hr className="flex-1 border-border" />
          <span className="text-primary-navy font-semibold text-md">ή</span>
          <hr className="flex-1 border-border" />
        </div>

        {/* RF code entry */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <h2 className="text-xl font-bold text-primary-navy mb-1 text-center">Εισαγωγή RF κωδικού</h2>
          <textarea
            rows={1}
            value={rfCode}
            onChange={(e) => {
              const val = e.target.value;
              if (val.toUpperCase().startsWith("RF")) {
                setRfCode(val);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleRfPay())}
            placeholder="Εισάγετε κωδικό RF"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-primary-navy text-lg font-mono focus:outline-none focus:ring-4 focus:ring-action-blue/40 placeholder:text-text-secondary/50 resize-none leading-snug overflow-hidden"
          />
          <Button
            loading={submitting}
            disabled={!rfCode.trim()}
            onClick={handleRfPay}
          >
            Έλεγχος
          </Button>
          <button
            onClick={() => setShowRfGuide(true)}
            className="text-text-secondary text-md underline underline-offset-4 focus:outline-none text-center"
          >
            Πού βρίσκεται ο RF κωδικός;
          </button>
        </div>
      </div>

      {/* "What should I scan?" modal */}
      {showScanGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 mb-12">
            <h2 className="text-xl font-bold text-primary-navy text-center">Τι να σκανάρω;</h2>
            <div className="flex flex-col gap-4">
              <p className="text-base text-text-secondary leading-snug">Στον λογαριασμό σας θα βρείτε έναν από τους παρακάτω κωδικούς:</p>
              <div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-px h-10 items-end">
                    {[3,1,2,1,3,1,2,3,1,2,1,3].map((w, i) => (
                      <div key={i} className="bg-primary-navy rounded-sm h-full" style={{ width: `${w * 3}px` }} />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-primary-navy">Γραμμωτός κωδικός</p>
                  <p className="text-xs text-text-secondary text-center">Κάθετες γραμμές, συνήθως στο πάνω μέρος του λογαριασμού</p>
                </div>
                <div className="flex flex-col items-center gap-2 mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-primary-navy">
                    <path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                    <path d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75V16.5ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                  </svg>
                  <p className="text-sm font-semibold text-primary-navy">QR κωδικός</p>
                  <p className="text-xs text-text-secondary text-center">Τετράγωνο με μικρά τετράγωνα μέσα</p>
                </div>
              </div>
              <p className="text-base text-text-secondary leading-snug">Πατήστε <strong className="text-primary-navy">«Σκανάρισμα»</strong> και στρέψτε την κάμερα πάνω του. Κρατήστε το τηλέφωνο σταθερό.</p>
            </div>
            <button
              onClick={() => setShowScanGuide(false)}
              className="mt-1 min-h-[56px] w-full rounded-xl bg-gradient-brand-diagonal text-white text-xl font-semibold active:opacity-90"
            >
              Κατάλαβα
            </button>
          </div>
        </div>
      )}

      {/* "Where is the RF code?" modal */}
      {showRfGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 mb-12">
            <h2 className="text-xl font-bold text-primary-navy text-center">Πού βρίσκεται ο κωδικός RF;</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">1️⃣</span>
                <p className="text-base text-text-secondary leading-snug">Πάρτε τον <strong className="text-primary-navy">έντυπο λογαριασμό</strong> σας (ρεύμα, νερό, τηλέφωνο κ.λπ.)</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">2️⃣</span>
                <p className="text-base text-text-secondary leading-snug">Ψάξτε για έναν αριθμό που <strong className="text-primary-navy">αρχίζει με «RF»</strong>, π.χ. <span className="font-mono text-sm bg-black/5 px-1 rounded">RF47 1234 5678…</span>. Βρίσκεται συνήθως στο πάνω μέρος του λογαριασμού.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">3️⃣</span>
                <p className="text-base text-text-secondary leading-snug">Πληκτρολογήστε τον αριθμό αυτό στο πεδίο και πατήστε <strong className="text-primary-navy">«Έλεγχος»</strong>.</p>
              </div>
            </div>
            <button
              onClick={() => setShowRfGuide(false)}
              className="mt-1 min-h-[56px] w-full rounded-xl bg-gradient-brand-diagonal text-white text-xl font-semibold active:opacity-90"
            >
              Κατάλαβα
            </button>
          </div>
        </div>
      )}

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
            <p className="text-white text-base">Στρέψτε την κάμερα σε γραμμωτό ή QR κώδικα</p>
            <button
              onClick={() => {
                stopCamera();
                setScanning(false);
              }}
              className="text-white/60 text-sm underline underline-offset-4"
            >
              Ακύρωση
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
