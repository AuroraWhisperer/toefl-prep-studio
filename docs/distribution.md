# 文件分发与许可

## 当前分发边界

| 文件 | GitHub 源码仓库 | 本机 |
| --- | --- | --- |
| `backend/`、`frontend/`、原创题库、导入工具 | 保留 | 运行所需 |
| README、PRODUCT、DESIGN、AGENTS、`docs/`、`specs/` | 保留 | 使用或维护说明 |
| `tests/`、`requirements*.txt`、`package*.json`、Playwright/Ruff/Prettier 配置、`.gitattributes`、`.gitignore` | 保留 | 开发维护需要；普通运行不需要 Node |
| `LICENSE`、`THIRD_PARTY_NOTICES.md`、字体 OFL | 保留 | 分发时一起保留 |
| `.venv/`、`node_modules/`、Python/测试/格式化缓存 | 忽略 | 可以重建 |
| `artifacts/`、录音、个人历史和会话 | 忽略 | 用户数据，不作为清理垃圾 |
| `tmp/`、临时音频、`.env*`（`.env.example` 除外） | 忽略 | 按实际用途保留，勿公开个人配置 |
| ETS 模考题面、答案、图片和含原题引文的解析 | 忽略 | 有相应权利时本地导入，见[题库维护](../question_bank/README.md#模考导入与隔离) |

源码仓库保留开发配置和锁文件；它们不是日常练习所需的运行文件，但不是无用文件。公开题库源码中包含原创答案；“交卷前不返回答案”是应用接口的边界，不代表源码仓库中的答案保密。

## 许可

原创代码和内容使用项目定制的 **TOEFL Prep Studio Noncommercial License 1.0**，正式条文为根目录 [LICENSE](../LICENSE)。它是源码可见的非商业许可，不是 OSI 标准开源许可。

允许非商业学习、教学、研究、测试、修改和按条款分享；分发时须保留许可和版权说明，标注修改并提供对应源码。销售、收费课程、商业培训、企业业务使用、收费或广告获利的在线服务等须另行取得相关权利人的书面许可。学校或非营利机构身份本身不构成商用豁免。个人学习不会仅因学习者有工作就被视作商用。

第三方内容适用自身条款，参见[第三方说明](../THIRD_PARTY_NOTICES.md)。该定制许可证尚未经律师审核；正式商业授权合同仍需按实际权利、用途和适用法律审阅。

## 已发布历史的处理

`.gitignore` 只阻止后续意外添加；`git rm --cached` 只取消当前索引的跟踪并保留本地文件。提交并推送这些修改后，旧提交仍可能包含 ETS 材料。

如需从现有远端历史移除材料，需在独立副本中筛除下列路径，检查所有待发布分支与标签，再以明确的旧远端提交为前提替换相应引用：

```text
question_bank/mock/
question_bank/answers/mock/
question_bank/sources/mock_explanations/
```

这会改写提交编号并影响已有克隆，应在备份本地完整题库和 Git 历史、确认协作范围后执行，不能用一次普通推送宣称历史已经清理。平台缓存、已有 fork、下载副本和他人克隆不受本地清理控制；必要时按 GitHub 的支持流程另行处理。
