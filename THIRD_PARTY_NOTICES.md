# 第三方材料与许可范围

本项目的 [非商业许可](LICENSE.md) 仅覆盖权利人有权授权的原创代码和内容，不替代第三方许可，也不授予第三方材料的再分发或商业使用权。

## ETS 试卷与商标

TOEFL、TOEFL iBT 和 ETS 是其权利人的商标。本项目独立开发，与 ETS 无隶属、赞助或认可关系；本地练习结果不是官方成绩。

ETS Practice Test 1–5 的原始 PDF、题面、脚本、答案及转换图片属于第三方材料。公开获取不代表允许重新发布；使用者须确认适用条款和必要授权。ETS 的[复制许可流程](https://www.ets.org/legal/permissions/how-to-request.html)与[许可政策](https://www.ets.org/legal/permissions/licensing.html)为授权依据，项目维护者不能代 ETS 授权。

以下材料仅供有相应使用权的本地安装使用，不纳入当前公开源码文件集：

| 路径 | 内容 |
| --- | --- |
| `artifacts/ets-reference/` | 使用者自行获取的官方 PDF |
| `question_bank/mock/` | 导入的题面、脚本和原卷图片 |
| `question_bank/answers/mock/` | 导入的答案键及引用原题的本地补充答案 |
| `question_bank/sources/mock_explanations/` | 包含原题引文的本地教学解析；不是 ETS 官方解析 |

本地导入步骤见[题库维护说明](question_bank/README.md#模考导入与隔离)。保留源链接或导入脚本不表示本项目已经获得再分发授权。历史提交中已有的材料不会因忽略规则或取消跟踪而自动消失；发布与历史处理见[分发说明](docs/distribution.md)。

## 字体

`frontend/fonts/cormorant-garamond-toefl.ttf` 是 Cormorant Garamond 的本地子集。

- Copyright 2015 the Cormorant Project Authors.
- 来源：[Cormorant](https://github.com/CatharsisFonts/Cormorant)。
- 许可：SIL Open Font License 1.1；完整文本随字体保存在 [OFL-CormorantGaramond.txt](frontend/fonts/OFL-CormorantGaramond.txt)。

字体继续适用 OFL；项目的非商业限制不替代或缩减 OFL 授予的字体权利。

## 软件依赖与外部服务

Python 和 Node 依赖由使用者根据 `requirements*.txt` 与 `package*.json` 安装，安装目录不随源码发布。各依赖适用其上游许可证；构建、打包或再分发依赖时须一并履行对应义务。

PDF 导入器使用 PyMuPDF，其上游提供 AGPL 与商业许可，详见 [PyMuPDF licensing](https://pymupdf.readthedocs.io/en/latest/about.html#license-and-copyright)。它是可选开发工具，不是本项目自有代码；本项目的非商业许可不能授予 PyMuPDF 的商业授权。

语音合成可能调用第三方在线服务。开源客户端的许可不等于在线服务或所生成音频的使用授权；相关服务条款继续适用。用户录音、答题记录和个人环境配置不纳入项目分发授权。
