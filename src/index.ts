import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

type Bindings = {
  R2_BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("*", async (c) => {
  // キャッシュ確認
  const cacheKey = c.req.url;
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  // R2からオブジェクトを取得 (リクエストパスの先頭の'/'を削除)
  const object = await c.env.R2_BUCKET.get(c.req.path.slice(1));
  if (!object) {
    throw new HTTPException(404, { message: "Object not found" });
  }

  // ETag検証
  const etag = object.httpEtag;
  const ifNoneMatch = c.req.header("If-None-Match");
  if (etag && ifNoneMatch && etag === ifNoneMatch) {
    return c.status(304);
  }

  // レスポンス生成
  const response = c.body(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || 'application/octet-stream',
      "ETag": etag || "",
      "Cache-Control": "public, max-age=3600",
    },
  });

  // 非同期でキャッシュへ保存
  if (response.ok) {
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
});

// エラーハンドリング
app.onError((err, c) => {
  console.error("Unhandled Error:", err);
  return c.json(
    {
      error: {
        message: err.message || "Internal Server Error",
      },
    },
    500,
  );
});

export default app;
