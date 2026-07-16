# AI伴播产品原型

AI伴播是一套面向内容电商直播团队的伴播内容生产与现场控制产品原型，包含管理后台、直播中控台浏览器插件和 PRD。

## 在线预览

- [AI伴播管理后台](https://yechangmian.github.io/ai-banbo-admin-prototype/)
- [直播中控台插件](https://yechangmian.github.io/ai-banbo-admin-prototype/live-console/)

## 本地运行

在项目目录启动静态文件服务：

```bash
python3 -m http.server 8128
```

打开以下页面：

- 管理后台：`http://127.0.0.1:8128/index.html`
- 直播中控插件：`http://127.0.0.1:8128/live-console/index.html`

## 项目文件

- `index.html`：AI伴播管理后台原型
- `live-console/`：直播中控台浏览器插件原型
- `assets/`：商品与数字模特案例素材
- `PRD.md`：产品需求文档

当前为静态交互原型，不包含真实后端接口、抖音开放平台回调和 AI 视频生成服务。
