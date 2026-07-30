# Daily Intelligence

每日整理 AI、文学与医学健康研究线索的网站。医学板块优先检索《柳叶刀》期刊系列的近期题录，并以 PubMed、CDC 与其他公开来源补充。

## 本地运行

```powershell
pnpm update-feed
pnpm dev
```

## 免费上线与每日更新

1. 在 GitHub 创建一个新的公开仓库，将这个文件夹推送到 `main` 分支。
2. 在仓库 **Settings -> Pages** 选择 **GitHub Actions** 作为发布来源。
3. 工作流 `.github/workflows/daily-publish.yml` 会每天 09:20（中国标准时间）刷新数据、构建并发布 GitHub Pages；也可在 **Actions** 页面手动运行。
4. GitHub Pages 会提供一个免费的 `用户名.github.io/仓库名` 地址。

## 绑定独立域名

独立域名需在注册商处购买并由账户持有人付款确认。购买后，在 GitHub Pages 的 Custom domain 填入域名，再按 GitHub 给出的 DNS 记录在注册商后台配置即可。

## 文献与版权说明

- 每条内容保留来源、检索位置、检索方式和原文入口。
- 《柳叶刀》等期刊的全文可能受版权保护，本站只显示公开元数据、题录线索和外链，不转载全文。
- 医学健康信息仅供学习和研究，不构成医疗建议。
