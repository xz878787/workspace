# Dockerfile：定义【单个容器镜像怎么构建】（菜谱）
# docker-compose.yml：定义【多个容器怎么一起启动、编排】（宴席菜单，一次性启动一堆

FROM elasticsearch:8.17.0

RUN elasticsearch-plugin install --batch \
  https://release.infinilabs.com/analysis-ik/stable/elasticsearch-analysis-ik-8.17.0.zip