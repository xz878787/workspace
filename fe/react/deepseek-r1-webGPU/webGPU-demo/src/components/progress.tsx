// Progress 进度条组件
// 比较独立的， 可复用的业务模块
interface ProgressProps {
  text: string;
  progress: number;
  total: number;
}

function Progress({ text, progress, total }: ProgressProps) {
  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span>{text}</span>
        <span>{progress}% ({formatSize(total)})</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default Progress;
