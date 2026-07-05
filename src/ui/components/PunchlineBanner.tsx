export function PunchlineBanner({ text }: { text: string }) {
  return (
    <blockquote className="rounded-xl border-l-4 border-gray-800 bg-gray-900 px-5 py-4 text-lg font-medium text-white">
      &ldquo;{text}&rdquo;
    </blockquote>
  );
}
