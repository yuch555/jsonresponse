# Mock API Server

フロントエンド開発のための超シンプルなモックAPIサーバー

## 🎯 コンセプト

- **1エンドポイント = 1ファイル** でわかりやすい
- JSONレスポンスを編集するだけで仕様変更に対応
- バックエンドとの会話が楽になる（JSONを見せればOK）
- エンドポイント追加が爆速

## 📦 インストール

```bash
npm install
```

## 🚀 起動

```bash
# 通常起動
npm start

# 開発モード（ファイル変更を自動検知）
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

## 📁 ディレクトリ構成

```
mock-api/
├─ server.js              # サーバー本体（基本的に触らない）
├─ routes/                # エンドポイント定義
│  ├─ auth.login.js
│  ├─ users.list.js
│  └─ users.detail.js
└─ responses/             # JSONレスポンス
   ├─ auth.login.success.json
   ├─ auth.login.error.json
   ├─ users.list.json
   └─ users.detail.json
```

## 📡 実装済みエンドポイント

### 認証

#### `POST /auth/login`

ログイン認証

**リクエスト例:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "pass"}'
```

**成功レスポンス（200）:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "山田太郎",
    "role": "user"
  }
}
```

**エラーレスポンス（401）:**
```bash
# error@test.com を送信した場合
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "error@test.com", "password": "pass"}'
```

```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "メールアドレスまたはパスワードが間違っています"
}
```

### ユーザー管理

#### `GET /users`

ユーザー一覧取得

**リクエスト例:**
```bash
curl http://localhost:3000/users
```

**レスポンス（200）:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "山田太郎",
      "email": "yamada@example.com",
      "role": "admin",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "perPage": 20
}
```

#### `GET /users/:id`

ユーザー詳細取得

**リクエスト例:**
```bash
curl http://localhost:3000/users/1
```

**成功レスポンス（200）:**
```json
{
  "id": 1,
  "name": "山田太郎",
  "email": "yamada@example.com",
  "role": "admin",
  "profile": {
    "bio": "フロントエンドエンジニア",
    "avatar": "https://via.placeholder.com/150",
    "location": "東京都"
  },
  "stats": {
    "posts": 42,
    "followers": 128,
    "following": 95
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-12-15T08:20:00Z"
}
```

**エラーレスポンス（404）:**
```bash
# ID 999 の場合
curl http://localhost:3000/users/999
```

```json
{
  "error": "User not found",
  "message": "User with ID 999 does not exist"
}
```

## ✨ 新しいエンドポイントの追加方法

### 1. ルートファイルを作成

```bash
touch routes/orders.create.js
```

```javascript
module.exports = async (fastify) => {
  fastify.post("/orders", async (req, reply) => {
    return require("../responses/orders.create.success.json");
  });
};
```

### 2. レスポンスJSONを作成

```bash
touch responses/orders.create.success.json
```

```json
{
  "orderId": "ORD-12345",
  "status": "pending",
  "createdAt": "2024-12-15T10:00:00Z"
}
```

### 3. サーバー再起動

```bash
npm run dev
```

それだけ！`server.js` は触らなくてOK。

## 🎨 フロント側での使い方

### 環境変数で切り替え

```javascript
// フロント側のAPI設定
const apiBase =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"  // モックAPI
    : "https://api.example.com"; // 本番API

// 使用例
fetch(`${apiBase}/users`)
  .then(res => res.json())
  .then(data => console.log(data));
```

### TypeScript型定義の生成

JSONレスポンスから型を生成できます:

```typescript
// types/api.ts
export interface LoginSuccessResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}
```

## 💡 Tips

### 分岐処理の追加

リクエスト内容で分岐できます:

```javascript
module.exports = async (fastify) => {
  fastify.post("/auth/login", async (req, reply) => {
    const { email } = req.body || {};

    // 特定のメールでエラーを返す
    if (email === "error@test.com") {
      return reply.code(401).send(require("../responses/auth.login.error.json"));
    }

    // 管理者用の特別レスポンス
    if (email === "admin@test.com") {
      return require("../responses/auth.login.admin.json");
    }

    // 通常のレスポンス
    return require("../responses/auth.login.success.json");
  });
};
```

### 遅延シミュレーション

```javascript
module.exports = async (fastify) => {
  fastify.get("/users", async (req, reply) => {
    // 500ms遅延させる
    await new Promise(resolve => setTimeout(resolve, 500));
    return require("../responses/users.list.json");
  });
};
```

### CORS設定

フロントとドメインが違う場合:

```bash
npm install @fastify/cors
```

```javascript
// server.js に追加
fastify.register(require("@fastify/cors"), {
  origin: true
});
```

## ❓ FAQ

### Q. 仕様が変わって無駄にならない？

A. なるが、それでいい。フロントが止まる損失より圧倒的に小さい。

### Q. バックエンドとズレない？

A. ズレる。だからズレが見える形（JSON）にするのが価値。

### Q. 本番でモックAPIが動いちゃわない？

A. `process.env.NODE_ENV` で切り替えれば安全。CI・本番には含めない。

## 📝 ライセンス

MIT
