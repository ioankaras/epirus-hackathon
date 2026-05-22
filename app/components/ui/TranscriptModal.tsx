"use client";

interface TranscriptModalProps {
  transcript: string;
  onClose: () => void;
}

export default function TranscriptModal({
  transcript,
  onClose,
}: TranscriptModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-primary-navy">Αποτέλεσμα</h2>
        <p className="text-foreground text-base leading-relaxed">{transcript}</p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-action-blue text-white font-semibold text-base hover:bg-action-blue-hover transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}
