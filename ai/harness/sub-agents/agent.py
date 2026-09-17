# 系统模块
import os 
# 写爬虫？ 爬取到内容，找我们需要的部分， 用正则 
import re 
# 子进程  子Agent 再全新的子进程运行， 直接隔离
import subprocess
# 路径模块
from pathlib import Path
import json
from openai import OpenAI 
from dotenv import load_dotenv

load_dotenv(override=True)
print(os.getenv("DEEPSEEK_API_KEY"))
# Agent工作目录  安全的， 被授权的
# python 没有常量变量之分， 都是变量， 用约定大写来表达
WORKDIR = Path.cwd()
# print(WORKDIR)
MODEL = os.getenv("DEEPSEEK_MODEL")

client = OpenAI(
  base_url = os.getenv("DEEPSEEK_BASE_URL"),
  api_key = os.getenv("DEEPSEEK_API_KEY"),
)

# resp = client.chat.completions.create(
#   model=os.getenv("DEEPSEEK_MODEL"),
#   messages=[
#     {"role": "user", "content": "你好"}
#   ],
# )
# print(resp.choices[0].message.content)
# print("sub agents ,harness 的高级扩展模块")
# 主Agent 系统提示
# python 隐式字符串拼接， 括号里连续放多个字符串字面量
SYSTEM = (
  f"You are a coding agent at {WORKDIR}."
  # 使用task 去执行针对性探索， 或是独立完整的子任务
  "Use task for focused exploration or a self-contained subtask."
)
SUB_SYSTEM = (
  f"You are a coding agent at {WORKDIR}."
  "Complete the given task, then return a concise final answer."
)
# print(SUB_SYSTEM, SYSTEM)
# python 弱类型脚本  
# 类型注解， 不按约束可以
# 传路径字符串， 返回Path 对象
# 所有Agent 公用的函数， 返回一个安全的路径， 不允许超出工作目录
# 否则抛出异常 ValueError
def safe_path(p: str) -> Path:
  # pathlib.Path 特有的 / 运算符， 不是除法， 运算符重载
  # 相当于路径的拼接  path.join(p)
  # python 有个原则， 简洁 人生苦短， 我用python 
  path = (WORKDIR / p).resolve()
  # 逻辑判断语法
  if not path.is_relative_to(WORKDIR):
    # 抛出异常
    raise ValueError(f"Path escapes workspace: {p}")
  return path 

#  跑命令行脚本 sub agent tool
def run_bash(command: str) -> str:
  # 列表
  dangerours = ["rm -rf /", "sudo", "shutdown", "reboot", "> /dev/"]
  # any() 就是只有一个满足就返回真
  # 判断任意一个关键词是否出现在command字符串里。
  if any(d in command for d in dangerours):
    return "Error: Dangerous command blocked"
  
  try:
    # 调用系统shell跑命令
    r = subprocess.run(command, shell = True, cwd=WORKDIR, capture_output = True,
     text=True, errors="replace", timeout=120)
    # 把标准输出 + 错误输出拼一起 
    out = (r.stdout + r.stderr).strip()
    #三元运算符的表达
    return out[:50000] if out else "(no output)"
  except subprocess.TimeoutExpired:
    return "Error: Timeout (120s)"
  # 元祖 
  except (FileNotFoundError, OSError) as e:
    return f"Error: {e}"

CHILD_TOOLS = [
  {
    "type": "function",
    "function": {
      "name": "bash",
      "description": "Run a shell command.",
      "parameters": {
        "type": "object",
        "properties": {
          "command": {
            "type": "string"
          }
        },
        "required": ["command"]
      }
    }
  }
]
# concat 
PARENT_TOOLS = CHILD_TOOLS + [
  {
    "type": "function",
    "function": {
      "name": "task",
      # 给子Agent 分配完全独立的上下文
      "description": "Spawn a subagent with fresh context. It shares the filesystem but not conversation history",
      "parameters": {
        "type": "object",
        "parameters": {
          "type": "object",
          "properties": {
            "prompt": {
              "type": "string",
              "description": "Short description of the task"
            }
          },
          "required": ["prompt"]
        }
      }
    }
  }
]

def agent_loop(messages: list):
  while True:
    response = client.chat.completions.create(
      model = Model,
      messages = [{ "role": "system", "content":SYSTEM }] + messages,
      tools = PARENT_TOOLS,
      max_tokens = 8000
    )
    msg = response.choices[0].message
    print(msg.content, "??")
    # 消息对象转为 Python 字典
    messages.append(msg.model_dump())
    if response.choices[0].finish_reason != "tool_calls":
      return
    results = []
    # Tool Calls
    msg = response.choices[0].message
    if msg.tool_calls:
      results = []
      for tool_call in msg.tool_calls:
        func = tool_call.function
        args = json.loads(func.arguments)

if __name__ == "__main__":
  print("Subagent - fresh messages, final text returns")
  print("Enter a question, press Enter to send.Type q to quit.\n")
  history = [] #  创建一个空列表
  while True:
    try:
      query = input("\001\033[36m\002s06 >> \001\033[0m\002")
    # 中断
    # ctrl + d  ctrl + c
    except (EOFError, KeyboardInterrupt):
      break
    print(query)
    if query.strip().lower() in ("q", "exit", ""):
      break
    history.append({"role": "user", "content": "query"})
    agent_loop(history)
    