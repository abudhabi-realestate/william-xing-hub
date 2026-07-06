# 幻灯片（PPT → 静态网页）

## 1. 放入源文件

把 `.pptx` 放到 `slides/source/` 目录，例如：

```
slides/source/为什么选择阿布扎比.pptx
```

## 2. 本地构建

在 `william-xing-hub` 根目录运行（需已安装 Microsoft PowerPoint）：

```bash
node tools/build-slides.mjs slides/source/你的文件.pptx deck-id "页面标题"
```

示例：

```bash
node tools/build-slides.mjs slides/source/WhyAbuDhabi.pptx why-abu-dhabi "为什么选择阿布扎比"
```

会在 `slides/why-abu-dhabi/` 生成 PNG 图片和 `meta.json`。

## 3. 预览

本地用任意静态服务器打开根目录，访问：

```
slides.html?deck=why-abu-dhabi
```

## 4. 上线

```bash
git add slides/ slides.html tools/
git commit -m "Add slide deck why-abu-dhabi"
git push origin main
```

线上地址：

```
https://abudhabi-realestate.github.io/william-xing-hub/slides.html?deck=why-abu-dhabi
```

## 说明

- 导出分辨率默认 1600×900，可在 `tools/build-slides.ps1` 调整。
- 源 `.pptx` 默认不提交 Git（见 `.gitignore`），只 push PNG 与 `meta.json`。
- 动画、视频、嵌入对象会导出为静态图（当前页最终状态）。
