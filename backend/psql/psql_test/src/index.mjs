import { pool } from "./db.mjs";
import * as users from "./users.mjs";
import * as conversations from "./conversations.mjs";
import * as messages from "./messages.mjs";

async function  run() {
  // const user = await users.createUser("李四");
  // console.log("创建用户:",user);
  // const fetchedUser = await users.getUserById(2);
  // console.log("查询用户", fetchedUser);
  // const updatedUser = await users.updateUser(2, "王五");
  // console.log("更新用户", updatedUser);
  // const conversation = await conversations.createConversation(
  //   1,
  //   "第一次对话"
  // );
  // console.log("创建会话", conversation);
  // const userConversations = await conversations.getConversationsByUserId(1);
  // console.log("用户的会话列表", userConversations);
  // const userMessage = await messages.createMessage(
  //   1,
  //   "assistant",
  //   "PostgreSQL是一个功能强大的开源关系型数据库。"
  // );
  // console.log("创建AI 消息", userMessage);

  const seedMessages = [
    { role: "user", content: "PostgreSQL 支持哪些数据类型？" },
    {
      role: "assistant",
      content:
        "PostgreSQL 支持整数、文本、JSON、数组，以及 pgvector 扩展提供的向量类型。",
    },
    { role: "user", content: "怎么做相似度搜索？" },
    {
      role: "assistant",
      content:
        "可以使用 pgvector 的 cosine 距离运算符 <=>，配合 hnsw 索引加速向量检索。",
    },
  ];

  // for (const msg of seedMessages) {
  //   await messages.createMessage(
  //     1,
  //     msg.role,
  //     msg.content,
  //     true
  //   );
  // }

  const query = "向量相似度怎么查"
  const results = await messages.searchSimilarMessages(
    1,
    query,
    2
  );
  console.log(results);

}
run()
  .catch(err => {
    console.error("运行失败", err.message);
    process.exit(1);
  })
  .finally(()=>pool.end())