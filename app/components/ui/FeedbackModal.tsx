"use client";

import Button from "./Button";

interface FeedbackModalProps {
  type: "success" | "error";
  title: string;
  message: string;
  buttonLabel?: string;
  onClose: () => void;
}

export default function FeedbackModal({
  type,
  title,
  message,
  buttonLabel = "OK",
  onClose,
}: FeedbackModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="bg-surface rounded-3xl p-8 w-full max-w-sm text-center">
        <div
          className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${
            type === "success" ? "bg-success/10" : "bg-accent-red/10"
          }`}
        >
          {type === "success" ? (
            <svg
              className="w-10 h-10 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-10 h-10 text-accent-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
        <h2 className="text-2xl font-bold text-primary-navy mb-2">{title}</h2>
        <p className="text-lg text-text-secondary mb-8">{message}</p>
        <Button
          onClick={onClose}
          variant={type === "success" ? "primary" : "danger"}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
