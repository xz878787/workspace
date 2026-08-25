# 1. 选一个基础镜像
FROM node
# 2. 在容器里切到/app 文件夹 设置工作目录
WORKDIR /app
# 3. 把本地代码复制进容器
COPY index.js . 
CMD ["node", "index.js"]