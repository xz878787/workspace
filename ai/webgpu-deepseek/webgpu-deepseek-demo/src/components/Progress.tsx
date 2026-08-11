function formatBytes(size) {
  if (!size || isNaN(size) || size <= 0) return "";
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    +(size / Math.pow(1024, i)).toFixed(2) * 1 +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

export default function Progress({ text, percentage, total }) {
  percentage ??= 0;
  // HuggingFace sends progress as 0-1 float, convert to 0-100
  if (percentage > 0 && percentage <= 1) percentage *= 100;
  // total could be 0 or NaN, only show if valid
  const totalStr = total && total > 0 && !isNaN(total)
    ? ` of ${formatBytes(total)}`
    : "";
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-700 text-left rounded-lg overflow-hidden mb-0.5">
      <div
        className="bg-blue-400 whitespace-nowrap px-1 text-sm"
        style={{ width: `${percentage}%` }}
      >
        {text} ({percentage.toFixed(2)}%{totalStr})
      </div>
    </div>
  );
}
