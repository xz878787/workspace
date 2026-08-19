# Docker
容器 
海运 万吨巨轮 
Docker
-node 
-next
-react
-redis
-mysql ....
除了代码， 依托一堆的， 有版本要求的 运行环境，  docker 帮我们打包为一个整体的容器， 非常方便的部署在任何设备上。

Agent= LLM +Harness(tool+mcp+rag+skill...+.....)
Docker= 应用 + 运行环境

## 举例
你到公司接手一个n年前Vue2 的项目， 要求使用Node16 +npm 8
你的电脑装的是node 22 ，跑不起来
容器化 docker 虚拟化技术， 将各个依赖隔离化安装 

## Docker 基本概念
应用程序+ 环境   隔离的
git pull image
container DVD 

## web 简单应用
http://localhost:1314
www.juejin.cn          :3000
:80 默认端口
运维知识
服务器软件  把所有在80 端口号的请求， 代理给3000端口


## nginx 服务器
高并发、代理转发， 需要nginx 
替【后端服务器】接收请求，隐藏后端集群。
监听80 端口的访问
并通过配置文件帮我们转发1314 端口

### 启动 nginx image
docker run 
  启动一个镜像， 成为可运行的容器
  --name my-nginx-demo
  容器的名字
  -p 80:80
  本机的80端口 :容器的80
  80 是nginx 的监视端口
  http://localhost:80 用户的浏览器输入
  转给， 映射给container 80
  -v D:\workspace\sw_ai\backend\docker\demo\nginx.conf
  nginx.conf 配置文件
  80 代理1314 端口
  -d nginx 
  后台运行nginx 

  docker run   --name my-nginx-demo  -p 80:80   -v D:\workspace\sw_ai\backend\docker\demo\nginx.conf -d nginx

docker run `
 --name my-nginx-demo `
 -p 80:80 `
 -v D:\workspace\sw_ai\backend\docker\demo\conf.d:/etc/nginx/conf.d `
 -d nginx
  

  用户上网intent-> browser(chrome)(正向代理 http)  ->
local:80 -> docker -p(ort): container(80) -> -v 映射
配置文件local:/etc/nginx/nginx.conf  -d (后台运行)
  nginx:80 <-:1314(反向代理) 
  localhost 我们是不知道后端具体在哪个端口上运行的

  -docker 
  pull 任何想要的镜像
  run 任何的镜像
  docker stop$(docker ps -q)
  docker rm$(docker ps -aq)
  docker rmi 

docker exec -it mysql-demo /bin/bash、

mysql -uroot -p123456

create database blog;




<!-- SHOW DATABASES;  USE blog;的区别 -->