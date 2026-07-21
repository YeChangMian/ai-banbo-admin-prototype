# AI伴播产品原型 V3

AI伴播是一套面向内容电商直播团队的伴播内容生产与现场控制产品原型。V3 将后台收敛为“工作台、制作伴播、伴播视频库、设置”四个一级菜单，并把商品、数字模特和展示模版管理整合进制作流程。

## 在线预览

- [AI伴播管理后台](https://yechangmian.github.io/ai-banbo-admin-prototype/)
- [直播中控台插件](https://yechangmian.github.io/ai-banbo-admin-prototype/live-console/)
- [V2 完整版存档](https://yechangmian.github.io/ai-banbo-admin-prototype/archive/v2/)
- [V1 复杂版存档](https://yechangmian.github.io/ai-banbo-admin-prototype/archive/v1/)
- [V2 字段精简试验版存档](https://yechangmian.github.io/ai-banbo-admin-prototype/archive/v2-minimal/)

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
- `index-v3.html`：V3 简化版原型源文件
- `index-v2.html`：V2 原型源文件
- `archive/v2/`：V2 完整版后台、插件、素材和 PRD 存档
- `archive/v1/`：V1 复杂版后台和 PRD 存档
- `archive/v2-minimal/`：字段精简试验版存档
- `live-console/`：直播中控台浏览器插件原型
- `assets/`：商品与数字模特案例素材
- `PRD.md`：产品需求文档

当前为静态交互原型，不包含真实后端接口、抖音开放平台回调和 AI 视频生成服务。详细产品规则见 `PRD.md`。
