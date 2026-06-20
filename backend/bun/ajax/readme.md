# Ajax 

## JSON.stringify(value, replace?, space?)
- 将对象序列化为JSON 格式字符串， 便于网络传输
- replace 取舍？ null 原样序列化
- space 给几个空格 团队规范， 可读性

## JS 异步处理
- js 是单线程， 遇到异步任务放到event loop 里， 跳过往下执行
- 等到执行时机到了，event loop 里面拿出回调函数来执行。callback
- 也可以使用Promise(封装异步任务) + then（）
- 最建议 async / await 
    比上面的两种都优秀
    跟同步看过去一样