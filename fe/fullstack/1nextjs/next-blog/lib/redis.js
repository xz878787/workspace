// node reis 客户端， 驱动
import Redis from 'ioredis';
export async function getAllNotes(){
const initialData = {
    // hash key 字符串ID 值  note 的序列化字符串
    // redis key:value value 特别支持hash类型
  "1702459181837": '{"title":"sunt aut","content":"quia et suscipit suscipit recusandae","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459182837": '{"title":"qui est","content":"est rerum tempore vitae sequi sint","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459188837": '{"title":"ea molestias","content":"et iusto sed quo iure","updateTime":"2023-12-13T09:19:48.837Z"}'
}
}
export async function getAllNotes(){
    const data= await Redis.hgetall('notes');
if (Object.keys(data).length === 0){
    await Redis.hset('notes', initialData);
}
return await Redis.hgetall('notes');
}