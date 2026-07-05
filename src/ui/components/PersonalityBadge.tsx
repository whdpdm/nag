import type { PersonalityBadgeProps } from '../../types/uiComponents.js';

export function PersonalityBadge({
  typeLabel,
  confidence,
  secondaryTypeLabel,
  theme,
}: PersonalityBadgeProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm"
      style={{ borderColor: theme.accent }}
    >
      <span className="text-3xl">{theme.badge}</span>
      <div>
        <p className="text-xs text-gray-500">판별 성향 · 확신도 {confidence}%</p>
        <p className="font-semibold" style={{ color: theme.accent }}>
          {typeLabel}
        </p>
        {secondaryTypeLabel && (
          <p className="text-xs text-gray-400">부 성향: {secondaryTypeLabel}</p>
        )}
      </div>
    </div>
  );
}
