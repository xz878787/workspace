// export default async function SidebarNoteList({ notes }) {
//   // hash 转成二维数组 [[noteId, jsonStr], ...]
//   const arr = Object.entries(notes || {});
//   if (arr.length === 0) {
//     return (
//       <div className="notes-empty">
//         No Notes created yet!
//       </div>
//     );
//   }

//   // 日期格式化：用原生 Date，避免引入未安装的 dayjs
//   function formatDate(isoStr) {
//     const d = new Date(isoStr);
//     const pad = (n) => String(n).padStart(2, '0');
//     return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
//   }

//   return (
//     <ul className="notes-list">
//       {arr.map(([noteId, note]) => {
//         const { title, updateTime } = JSON.parse(note);
//         return (
//           <li key={noteId}>
//             <header className="sidebar-note-header">
//               <strong>{title}</strong>
//               <small>{formatDate(updateTime)}</small>
//             </header>
//           </li>
//         );
//       })}
//     </ul>
//   );
// }
import SidebarNoteItem from '@/components/SidebarNoteItem';
export default asynction SiderNoteList({notes}){
    
}