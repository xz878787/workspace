// interface ProgressProps {
//   text: string;
//   percentage?: number;
//   total?: number;
// }

// function Progress({ text, percentage, total }: ProgressProps) {
//   return (
//     <div className="mb-1">
//       <div className="flex justify-between text-xs">
//         <span>{text}</span>
//         <span>
//           {percentage !== undefined
//             ? `${(percentage * 100).toFixed(1)}%`
//             : total
//             ? `${total} files`
//             : ""}
//         </span>
//       </div>
//       {percentage !== undefined && (
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div
//             className="bg-blue-500 h-2 rounded-full transition-all"
//             style={{ width: `${percentage * 100}%` }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default Progress;
// 返回jsx 的函数就是组件
// 函数接受参数， 复用组件的时候，进度、文件、大小不一样 
// 组件的属性 html 属性的方式传过来的 props

interface ProgressProps {
  text: string;
  progress: number;
  total: number;
}

function formatBytes(size: number): string {
  // 计算应该用哪个单位（0=B, 1=kB, 2=MB...），size为0时直接用B
  // 几次方 
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    // 1024 的 i次方
    // 把字节数除以对应单位量级，保留两位小数后转回数字
    +(size / Math.pow(1024, i)).toFixed(2) * 1 +
    // 拼接上对应的单位字符串
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}


const Progress = ({ text, progress, total }: ProgressProps) => {
  // console.log(text, percentage, total);
  // es6+ 编程风格
  const percentage = progress ?? 0;
  return (
    <div className="w-full bg-gray-100 text-left rounded-lg overflow-hidden mb-0.5">
  <div 
  //{js 运行区域 返回?  style 返回行内样式的key： value 对象}
  style={{width: `${percentage}%`}}//行内样式
  className="bg-blue-400 whitespace-nowrap px-1 text-sm">
    
    {text}
    {percentage.toFixed(2)}%
    {isNaN(total) ?"" : ` of ${formatBytes(total)}`}
  </div>
    </div>
  )
}
export default Progress
