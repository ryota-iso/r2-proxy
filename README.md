# Cloudflare R2のオブジェクトを配信するCloudflare Workers
Cloudflare Workers向けのシンプルなオブジェクトサーバ
Cloudflare R2からオブジェクト取得し、キャッシュやETag検証を行なった後に配信

## 環境構築
### 事前準備
1. (volta)[https://volta.sh/]のインストール (`curl https://get.volta.sh | bash`)
2. `pnpm install`
3. `pnpm dev`

## デプロイ方法
1. `wrangler.jsonc`の`bucket_name`にバケット名を記入
2. `pnpm wrangler login`でCloudflareアカウントにログイン
3. `pnpm run deploy`
