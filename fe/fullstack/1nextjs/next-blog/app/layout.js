import './style.css';
import Sidebar from '../components/Siderbar';

export default async function RootLayout({children}) {
  return (
    <html>
      <head>
     
        <title>
          我的AI工程化 Blog
        </title>
        <meta name="description" content="这是一位未来模型工程师的笔记，多年心血，深入研究AI工程化" /> 
        <meta name="keywords" content="llm,claude,ai,工程化" />
        </head>
        
         <body>
        <div className="container">
          <div className="main">
            <Sidebar/>
            <section className="col note-viewer">{children}</section>
          </div>
        </div>
      </body>
    </html>
  )
}