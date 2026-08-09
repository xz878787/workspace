import { useState, useRef } from 'react';

function CommentBox() {
  const [comments, setComments] = useState([
    { id: 1, text: '这是第一条评论', author: '张三' },
    { id: 2, text: 'React Hooks 真好用', author: '李四' },
  ]);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');

  const textareaRef = useRef(null);

  const handleClick = () => {
    const comment = textareaRef.current.value;
    if (!comment) return alert('请输入评论内容');
    console.log(comment);
    setComments([
      ...comments,
      { id: Date.now(), text: comment, author: author.trim() || '匿名' },
    ]);
    setText('');
    setAuthor('');
    textareaRef.current.value = '';
  };

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>评论区</h3>
      <p>昵称：</p>
      <input
        type="text"
        placeholder="昵称"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        style={{ marginRight: '10px', padding: '5px' }}
      />
      <p>评论内容：</p>
      <textarea
        ref={textareaRef}
        placeholder="请输入评论内容"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '400px', height: '60px', padding: '5px' }}
      />
      <br />
      <button onClick={handleClick}>提交评论</button>
      <ul style={{ marginTop: '15px', listStyle: 'none', padding: 0 }}>
        {comments.map((c) => (
          <li key={c.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
            <strong>{c.author}：</strong>{c.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CommentBox;
