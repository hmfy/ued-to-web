# 学员练习目录

这里预先建立了所有学员的目录。每位学员将每周从 `templates/` 复制出来的模板，保存到自己的周次目录中。

目录约定为 `learners/<姓名拼音>/week<序号>/`。

每周开始时，将对应周次模板复制到自己的目录：

```bash
cp -R templates/week<序号> learners/<姓名拼音>/week<序号>
cd learners/<姓名拼音>/week<序号>
```

每次开始一周作业时，先同步 `main`，再切换到自己的周分支：

```bash
git switch main
git pull origin main
git switch -c feat/week<序号>-<姓名拼音>
```

例如第 00 周杨帆的分支是 `feat/week00-yangfan`。已有分支使用 `git switch feat/week<序号>-<姓名拼音>` 切换。

请不要直接修改 `templates/` 中的模板；模板由老师维护，学员材料写在自己的 `learners/<姓名拼音>/week<序号>/` 目录中。
