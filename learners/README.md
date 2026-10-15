# 学员练习目录

这里按周存放学员从 `templates/` 复制出来的实际学习材料。

目录约定为 `learners/week<序号>/<姓名拼音>/`。

每次开始一周作业时，先同步 `main`，再切换到自己的周分支：

```bash
git switch main
git pull origin main
git switch -c feat/week<序号>-<姓名拼音>
```

例如第 00 周杨帆的分支是 `feat/week00-yangfan`。已有分支使用 `git switch feat/week<序号>-<姓名拼音>` 切换。

请不要直接修改 `templates/` 中的模板；模板由老师维护，学员材料写在自己的目录中。
