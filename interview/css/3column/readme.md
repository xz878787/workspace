# 3列布局
-PC端常见的布局方案
- 左右两列指定宽度，中间自适应宽度
- main 最先加载 中间先渲染， 最快看到最有效的内容，
左右两侧往往广告、导航， 可以晚一点 
flex & grid & float

## BFC
Block Formating Context
html 开始， 根， 开启了第一个格式化上下文 BFC
块级元素从上到下， 行内元素从左到右排列 最基础的文档流

一个块， 加上多列？ inline 不适合做盒子(容器)
局部布局方案， 可以开启一个新的BFC 不是Block 元素
block 元素 + display: flex|grid|table... float:left;
position ,overflow:hidden 开启一个新的BFC
新的格式化上下文，有自己的主义(格式化)
