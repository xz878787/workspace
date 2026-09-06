# Skills 会议室
会议纪要skill
## 场景 
班味 
开不完的会， 牛马不停的收到收到 。
重复的工作， 会议纪要专员， 
会议有个主题， 抽像 要解决什么问题， 谁负责? 截止日期? 
王老板 发言 .....
产品经理  发言 ....
程序员 要排期
设计师
测试 测试 
AI 硬件   录音 -> 文本 -> 会议纪要
-> skill 自动化  

## skill-creator
创建一个会议纪要skill , 它拥有会议小秘书的专项技能， 根据会议纪要文件或录音(钉钉硬件)， 生成会议纪要， 将重复的(什么主题， 谁负责，截止时间)， 繁琐的工作自动化， OPC 迈进。 

### skill - creator 
固定的结构和模式
- 文件夹 hys meeting 
  - SKILL.md  会议室 skill
重复的工作、专业的技能， skill.md 记录下来
prompt 固化在我们的项目中了。
- skill- creator 
会有自己封装skill的需求， 当我们频繁重复的时候
anthorpic 官方推出的 skill-creator 标准化、简化skill的 封装的.

随时创建自己的skill

- SKILL.md 固定格式
- 基础头部
使用yaml 格式隔开 {}  .env key=value
name 
description 描述功能 ， 给大模型判断是否要使用的 

## 场景二
每天， 我们都被海量的AI 信息淹没，。 想要了解行业动态， 但没有时间一个一个网站去刷?
重复但必须得去学习/工作 
