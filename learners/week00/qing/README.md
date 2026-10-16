# Week 0：前端环境配置与 Git 入门

本周是 UED 全栈转型的启动周。本目录只提供任务说明和记录材料，不提供业务代码模板。目标是装好前端开发工具，能够自行创建并启动一个项目，并完成一次完整的 Git 协作流程。

## 自我介绍

hello大家好，我是代海清，02年的，来自公司仓储部门
"练习两年半的前端初级编程师"😂——哈哈开玩笑的，其实我是零基础刚入门。这次参加 UED 转型，是想真正学会把设计稿做成能跑起来的页面。
平时喜欢打篮球、钓鱼，也喜欢广交朋友，希望大家都能和我做好朋友呀。

## 本周目标

- 能使用 Node.js 和 pnpm 安装、运行前端项目。
- 能在 VS Code 或 Cursor 中打开并编辑项目。
- 能在 Chrome 中查看页面并进行基础调试。
- 理解仓库、提交、分支、远程仓库和 Merge Request。
- 独立完成一次“分支 → 提交 → 推送 → 提交 MR”的流程。

## 一、环境配置

### 工具清单

| 工具 | 用途 | 验证命令 |
| --- | --- | --- |
| Node.js | JavaScript 运行环境 | `node -v` |
| pnpm | 前端包管理器 | `pnpm -v` |
| VS Code / Cursor | 代码编辑器 | 能打开并编辑文件 |
| Git | 版本控制工具 | `git --version` |
| Chrome | 页面运行和调试 | 能正常打开 |

### 编辑器插件

- ESLint：实时提示代码问题
- Prettier：统一代码格式
- GitLens：查看 Git 历史
- Tailwind CSS IntelliSense：Tailwind 类名补全
- React Extension Pack：React 开发支持
- Chinese (Simplified)：中文语言包

### 账号准备

- 登录公司 GitLab，并加入 UED 转型学习仓库。
- 确认可以访问课程仓库。
- 注册 Apifox 账号备用。
- Figma 账号沿用已有账号即可。

## 二、本周作业流程

本周三个作业按以下顺序完成。Git 实战是贯穿全流程的第一个作业，后面的环境截图、自评表和 React 工程都要在自己的周分支中完成。

### 作业一：Git 仓库与分支实战

先克隆当前课程仓库，再按仓库约定创建个人 Week 00 分支：

```bash
git clone <课程练习仓库地址>
cd <课程练习仓库目录>
git switch main
git pull origin main
git switch -c feat/week00-<姓名拼音>
```

如果个人周分支已经存在，使用 `git switch feat/week00-<姓名拼音>` 切换，不要重复创建分支。

### 作业二：复制模板并完成环境记录

在个人周分支中，将 Week 00 模板复制到自己的作业目录：

```bash
cp -R templates/week00 learners/week00/<姓名拼音>
cd learners/week00/<姓名拼音>
mkdir -p screenshots
```

然后：

1. 打开并填写 `self-assessment.md`，每项能力只勾选一个选项，并补充本周目标、困难和预计投入时间。
2. 在终端执行下面的命令，并将能清晰看到输出的截图保存到 `screenshots/environment-versions.png`：

   ```bash
   node -v
   pnpm -v
   git --version
   ```

3. 在 `README.md` 中补充自我介绍、学习记录和后续的 Merge Request 链接。

### 作业三：启动 React 工程并完成提交

React 工程必须创建在自己的 Week 00 作业目录内：

```bash
pnpm create vite@latest ued-demo -- --template react-ts
cd ued-demo
pnpm install
pnpm dev
```

在浏览器打开终端输出的本地地址，确认可以看到 Vite + React 页面，并将运行页面截图保存到 `screenshots/react-running.png`。本周不要求编写业务功能，但必须提交 `ued-demo/` 的源码、`package.json` 和 `pnpm-lock.yaml`；不要提交 `ued-demo/node_modules/`。

## 三、最终检查与提交

确认个人目录中至少包含以下内容：

```text
learners/week00/<姓名拼音>/
├── README.md
├── self-assessment.md
├── screenshots/
│   ├── environment-versions.png
│   └── react-running.png
└── ued-demo/
```

检查状态并提交推送：

```bash
git status
git add learners/week00/<姓名拼音>/
git commit -m "docs: 完成启动周作业"
git push origin feat/week00-<姓名拼音>
```

推送成功后，在 GitLab 页面创建 Merge Request，将链接补充到个人 `README.md`。至此，Git 实战、环境记录和 React 工程三个作业完成；如果导师提出修改意见，完成修改后重复 `git add → git commit → git push`。

## Commit 信息规范

提交信息使用“类型 + 动词开头的简短描述”：

```text
feat: 新增登录页表单
fix: 修复表单校验不生效
style: 调整首页间距
docs: 完成启动周作业
```

不要使用“修改了一些东西”这类无法说明改动内容的描述。

## 遇到问题时如何求助
   2222
先搜索完整报错或询问 AI；仍未解决时，在群里说明：

1. 做了什么操作
2. 期望看到什么
3. 实际报了什么错
4. 操作系统、Node 版本和已尝试的处理方式

请附完整截图，不要只说“项目跑不起来”。

## 学习记录

- 完成日期：2026-10-17
- Node.js 版本：v24.19.0
- pnpm 版本：12.11.2 
- Git 版本：2.55.0
- 我已经掌握：克隆仓库、建分支、复制文件
- 仍然不确定：HTML/CSS 只了解概念、没自己写过；JavaScript、React、TypeScript 完全没接触 
- 最大难点：目前时间比较少
- 每周预计投入时间：4小时
- Merge Request 链接：https://github.com/hmfy/ued-to-web/pull/1
