# Week 01 作业：HTML、CSS 与布局基础

复刻 [ChargeWipe About](https://chargewipe.com/about)，并额外完成首页。

|     | 页面             | 文件                          |
| --- | -------------- | --------------------------- |
| 基础版 | About          | `index.html` + `styles.css` |
| 进阶版 | 首页（加分 10%–20%） | `home.html` + `home.css`    |

技术栈：HTML + CSS，加少量原生 JS（FAQ 手风琴、导航菜单的键盘可达性）。
无框架、无构建步骤，直接打开 `home.html` 即可。

## 目录

```text
learners/qing/week01/
├── README.md
├── index.html          About 页
├── styles.css          两页共用
├── home.html           首页
├── home.css            首页专属
├── nav.js              导航下拉菜单（键盘可达性）
├── home.js             首页 FAQ 展开收起
├── images/             23 个素材
├── fonts/              Inter 字体（自托管）
├── screenshots/
│   ├── desktop.png          About 1440px
│   ├── mobile.png           About 390px
│   ├── home-desktop.png     首页 1440px
│   └── home-mobile.png      首页 390px
└── scripts/            自用校验脚本（页面不依赖，可删）
```

---

## 一、页面结构和主要布局思路

### 结构

两个页面共用同一套语义骨架：`header` 导航 → `main` 分区块 → `footer`，
外加 `a.skip-link` 供键盘用户跳过导航。每个区块一个 `<section>`，
内部只有一个 `<h1>`，标题层级 `h1 → h2 → h3` 不跳级。

About 页四个区块：About（左文右图）、Detailed Introduction（左图右文）、
Why ChargeWipe?（蓝色 banner + 4 条优势）、Our Resources（合作方示意）。

首页六个区块：Hero、What Can We Do（3 列卡片）、Products（左图右 4 条）、
Why Choose、FAQs（手风琴）、Contact（深色面板）。

### 布局

**统一内容列 + 分区块内边距**：每个 section 整行铺满并给左右 padding，
内部再套 `max-width: 1152px; margin: 0 auto` 的容器，文字对齐同一条中轴。

两栏区块用 grid，例如 Hero：

```css
.hero-inner { grid-template-columns: minmax(0, 1fr) 500px; gap: 60px; }
```

`592 + 60 + 500 = 1152`，正好填满。用 `minmax(0, 1fr)` 而不是 `1fr`，
防止长英文单词把栅格撑破。

响应式断点 **1024px / 640px**：两栏变单栏、标题从 40px 降到 22px、
主导航收进汉堡按钮、部分配图切换成手机专用版本（用 `<picture>`）。

尺寸都是量出来的，不是目测。最终对比：

| 区块                    | 桌面参考     | 桌面我的     | 移动参考 | 移动我的     |
| --------------------- | -------- | -------- | ---- | -------- |
| About ChargeWipe      | 560      | **560**  | 728  | **728**  |
| Detailed Introduction | 524      | **524**  | 747  | **747**  |
| Why ChargeWipe?       | 1083     | **1083** | 1186 | **1186** |
| Our Resources         | 410      | **410**  | 458  | **458**  |
| **整页**                | **3002** | **3002** | 3755 | 3764     |

首页桌面端整页 4979 vs 参考 4983（差 0.08%），其中 Products / Why / Contact
三个区块高度完全一致。

---

## 二、AI 辅助或调整记录

### 我的做法

不让 AI 凭肉眼写样式，而是先让它**量**：

1. 用无头浏览器打开线上参考页，把每个区块的
   `top / height / padding / font-size / grid-template-columns` 导出成 JSON；
2. 让 AI 严格按这份数据写 CSS；
3. 再量自己的页面，逐元素比差值，不为 0 就回去查原因。

### 关键提示词

> 你是一名资深的 ai 全栈编程师，你应该怎么复刻这个网站，需要什么信息以及
> 怎么跟 AI 沟通能做到一模一样的复刻呢 https://chargewipe.com

> 分析 chargewipe.com 的渲染结果，告诉我框架、CSS 方案、字体加载方式，
> 以及断点取值

> 用无头浏览器导出 /about 在 1440 和 390 下每个 section 的
> top/height/padding 和每个文本的 font-size/line-height/color，输出 JSON

> 严格用这些数值写 CSS，不要自己估色彩和间距；用 CSS 变量收敛颜色

> 先做 About + 首页两个把这两个

### 我验收时发现的问题

这三处是**我自己看页面时发现的**，AI 没有主动报告：

| #   | 问题                | 原因                                      |
| --- | ----------------- | --------------------------------------- |
| 1   | 浏览器标签页的 logo 糊成一条 | 用了横版品牌图（5:1），塞进方形标签框不合适。换成方形 `.ico`     |
| 2   | 按钮箭头方向反了          | View 按钮该用 `→`，误用了首页 `←` 的图标             |
| 3   | 标题行数和颜色不对         | 参考页标题 2 行且首词 `Chargeback` 是红色，我这边 3 行全黑 |

**第 3 条的根因**：参考页的 `h1` 内部是两个 block span，第一个带
`whitespace-nowrap`，故意让文字溢出盒子也不换行，从而强制两行；
`Chargeback` 外面还套了一层 `text-[var(--accent)]`。我最初只取了外层元素的
`color`（黑色），没往里看，所以漏掉了红色。

> 说明：其他技术性修正（字体、栅格、间距等）是 AI 通过测量脚本自己发现并改的，
> 不是我先看出来的。上面这三条才是我肉眼抓到的。

---

## 三、遇到的问题及解决方式

### 1. 字体不对，断行全错

卡片高度怎么调都差 26px。用 `measureText` 测同一句话，两边都是 328.03px，
以为跟字体无关。后来打印 `document.fonts` 才发现：参考页有 8 个 `@font-face`
且 `status=loaded`，我的页面根本没加载字体——本机没装 Inter，一直在用回退字体。

**解决**：从参考页下载 `inter-latin.woff2` 自托管，并按它的规则补一条
`size-adjust: 107.12%` 的 fallback。改完整页从 2918 → 2994。

**教训**：像素级复刻时，「字体对不对」比「间距差 2px」重要得多。

### 2. `margin` 不会让盒子变窄

给正文加 `margin-left: 18px` 想缩进，结果文字区仍是 800px，只是整体右移，
每行反而能塞下更多字，断行完全不同。

**解决**：把缩进提到父级（`padding-left: 26px`），文字区变成 774px，
断行立刻对上。

### 3. FAQ 手风琴点了没反应

`aria-expanded` 变成 `true`，但面板高度始终不变。查 `grid-template-rows`
发现一直是 `0px`。原因是我写了相邻兄弟选择器：

```css
.hp-faq-btn[aria-expanded="true"] + .hp-faq-a { /* 匹配不到 */ }
```

但 DOM 是 `article > h3 > button`，`.hp-faq-a` 是 `h3` 的兄弟，不是 `button` 的。
改用 `:has()` 从 `article` 往下找，面板从 61px 撑到 118px。

> 这个 bug 看截图发现不了——收起和展开在截图上都「看着正常」。

### 4. 为了对齐桌面端，写坏了移动端

给 Why 列表加 `white-space: nowrap` 后桌面高度更接近参考，但同一份样式在手机上
把 `scrollWidth` 顶到 525，产生横向溢出。作业明确要求「避免内容溢出」，
所以手机端改回 `white-space: normal`，接受多 85px 高度。

---

## 验收结果

两个页面都跑了自动检查，全部通过：

| 检查项                       | About     | 首页        |
| ------------------------- | --------- | --------- |
| 横向溢出（320–1920 共 11 个宽度）   | 无         | 无         |
| 键盘焦点停靠点                   | 14 个，全部可见 | 24 个，全部可见 |
| 图片与字体加载                   | 全部成功      | 全部成功      |
| 语义结构（lang / 唯一 h1 / 标题层级） | 通过        | 通过        |
| FAQ 手风琴（点击、键盘、单开互斥）       | —         | 通过        |

## 已知不足

1. **移动端整页高度**：About 差 9px（0.24%）、首页差 82px（1.8%），
   集中在页脚间距和文字换行行数，不影响可用性。
2. **汉堡按钮没有展开逻辑**：作业不要求交互，只做了语义正确的按钮。
3. **部分链接是 `#` 占位**：只做了 About 和首页，其余页面未做。
4. **只做英文版**：参考页本身是英文。
