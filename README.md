# Map Marker App 📍

Google Map上に場所をマークしてコメントを追加できるWebアプリケーション。

## 機能

- 🗺️ Google Map表示
- 📍 クリックでマーカー追加
- ✏️ マーカーにタイトル・説明・カテゴリを設定
- 🎨 マーカーの色をカスタマイズ
- 📝 マーカー一覧表示
- 🗑️ マーカーの編集・削除

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **@vis.gl/react-google-maps** (Google公式Reactコンポーネント)
- **Prisma** + SQLite (データベース)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを編集して、Google Maps API Keyを設定:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY_HERE"
```

### 3. Google Maps API Keyの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成
3. Maps JavaScript API を有効化
4. 認証情報 > APIキーを作成
5. APIキーを `.env` に設定

### 4. データベースのセットアップ

```bash
npx prisma migrate dev
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

## 使い方

1. 地図をクリックして新しいマーカーを追加
2. サイドバーでマーカー情報を入力
3. マーカーをクリックして詳細を表示
4. サイドバーのリストからマーカーを編集・削除

## ライセンス

MIT
