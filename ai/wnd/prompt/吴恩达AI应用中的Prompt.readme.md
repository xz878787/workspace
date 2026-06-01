# 吴恩达AI应用中的Prompt

## Prompt Priinciples
- 使用清晰且详细的Prompt
- llm 响应约束返回结构 json

- 五个构建块

## get_response 函数
- 参数默认值是函数的代码优化的重要语法
特性
- 好复用、灵活、简便
- llm api
    - completions 完成
        prompt
    - chat.completions 完成
          messages=[
            {"role":"system","content":""}
            {"role":"user","content":prompt}
            {"role":"assistant","content":""}
            {"role":"user","content":""}
          ]
          ## 吴恩达prompt 规则
          llm 智能能力高级， 靠谱的为我们工作？
          通过一系列规则， 减少智能的随机性。
          - 清晰且具体的表达
          清晰 让大模型理解我们的目的，不偏离主题或少犯错误
          具体 提供上下文
          - 总结案例里使用清晰的格式区间，告诉llm 我们待处理的文本在哪里？
          {text}{}是字符串模板中的占位符 
          使用特殊的符号```来清晰地指出要处理的文本
          总结， summarize nlp 机器学习的常见任务
          - 对响应的结果格式做约束， 一般为json ，
            继续丰富json 的key ，还
- Few-shot 即少样本提示，在 Prompt 里附带少量示例，让模型参照格式、逻辑与风格，快速对齐任务要求，无需复杂指令。
- llm 有幻觉的，真真假假？
