# JS 同步异步
##  js 有哪些异步任务
cpu执行时间 不能霸占，几十毫秒的
轮询分配给进程的执行时间 。
进程 董事长 PID process
线程 经理 Thread
主线程、还可以启动子线程

- c++, java 等系统级别语言有多线程，
执行效率高，但复杂，
- js 简单， 设计为单线程 
  setTimeout
  事件
  怎么办?

  ## JS 执行机制
  - 前端script 或后端 node /bun 代码执行
  - 启动一个进程 PID 负责分配资源
  - 进程启动一个主线程
    JS 足够简单， 单线程
  - 先把同步任务快速执行掉，可以快速的把同步代码，用户需要看到的页面，
  - 还是有定时器、fetch 请求、事件等等耗时性的异步任务 Async task 
  - js 会把他们 放到 event loop 中
        ， 跳过， 先执行后面的同步代码，
        等同步代码执行完，再到event loop 中把
        异步代码拿出来执行。

  ## 控制执行流程呢? 
  A fetch users api 所有的用户      
  B fetch 每一个用户 

  ## 理解Promise 
- 实例化Promise 
- 需要传递一个函数，executor
 会立即执行， 是耗时性任务的容器
 同步， 里面可以容纳异步任务
 会得到 resolve reject 两个函数能力
 - resolve 表示异步任务成功解决了
    then 被调用
- reject 表示异步任务失败了，
    catch 被调用
- 在executor里面 的异步任务成功解决或
异常时，手动调用
- resolve(result) 传给then 
- reject(error) 失败的原因
