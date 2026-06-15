# AI 游戏

- 页游
4399 falsh 游戏
html5 2d/3d 游戏

## HTML5 炫酷功能
Canvas 2d/3d 数据可视化/ 网页游戏/ 酷炫页面 
- canvas 标签 
画布   js api 想怎么画就怎么画

- canvas api
  - canvas 有大量的js 绘制api 
  - 受限获取 canvas 标签
  - getContext(2d/3d)  上下文
    ai 游戏爆发 three.js
    物理大模型
- 绘制各种模型
   rect 方形
   circle 圆
   line
   clearRect()
   左上角+ 宽/高
- 颜色
   fillStyle 填充
   strokeStyle 描边
- 怎么做游戏？
    按帧动画
    - clear 擦带=掉之前的
    - 画上新的
    - 显卡帧 1s 60次

    ## requestAnimationFrame()
    浏览器提供的适配屏幕刷帧率的高校动画帧调度函数
    - 不能用setInterval
      时间可能和显示设备的刷帧率不在一个频道上
      requestAnimationFrame() 是等于刷帧率， 体验更协调
    - 参数 递归的方式 绘制函数
    - clear 方法
       帧动画不停的画， 就有了动画
       加上交互， 游戏了。

       ## 飞机游戏
       - 工程初始化
         vite ,git
         帮我们安装必要的依赖
         .env
         - 可以和cc 头脑风暴
            - 产品 游戏功能列表， 选择其中的一些，
            做第一阶段的开发
            MVP 最小可行性方案
            技术路线什么样？
            技术方案
    - llm 生成 
    ## 数据可视化 
     echart 报表