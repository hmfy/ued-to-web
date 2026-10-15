# UED 全栈转型学习仓库

本仓库用于支持 UED 前端转型学习，以及原有 Go 作业提交。课程内容会按周逐步补充，具体学习目标、作业要求和提交说明以对应周次模板中的 README 为准。

## 目录结构

```text
go-task/
├── README.md
├── templates/               # 老师维护的每周初始化模板
│   └── week<序号>/
├── learners/                # 按周组织的学员实际作业
│   └── week<序号>/
│       └── <姓名拼音>/
└── .gitignore
```

## 使用方式

每周开始时，将对应模板复制到“周次 / 学员拼音”目录：

```bash
cp -R templates/week<序号> learners/week<序号>/<姓名拼音>
```

然后进入学员目录，阅读该周模板中的 `README.md`，按其中的说明完成学习和提交。

模板由老师维护，学员只修改自己的 `learners/week<序号>/<姓名拼音>/` 目录。完成作业后，在对应的个人周分支上提交并发起 Merge Request。

## 分支约定

每次开始一周作业时，先在 `main` 分支同步最新代码，再切换到自己的周分支：

```bash
git switch main
git pull origin main
git switch -c feat/week<序号>-<姓名拼音>
```

分支命名格式为 `feat/week<序号>-<姓名拼音>`，例如 `feat/week00-yangfan`。如果分支已经创建过，使用 `git switch feat/week<序号>-<姓名拼音>` 切换即可。

## 约定

- `templates/` 只存放可复制的课程初始模板。
- `learners/` 按 `week<序号>/<姓名拼音>/` 组织实际练习材料。
- 每周的技术栈、依赖、检查方式和作业要求由该周模板自行决定。
- 遇到问题时，提交完整的操作步骤、报错信息、环境信息和截图。
