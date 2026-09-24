// 连接
// sql 执行
import "dotenv/config";
import pg from "pg"; // 驱动
// 服务器代码 node  数据库独立
// 瓶颈，同时能服务的连接是有限的 连接池， 
// 如果sql 需求过多， 等待 
// 如果要执行sql 一定要拿到， 或排队拿到Pool 连接对象
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})
// 任何的sql 的执行 text 拼接的sql, params 参数
async function query(text, params) {
  return pool.query(text, params);
}

export { pool, query }