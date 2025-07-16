# Claude Development Guidelines

このファイルは、sharedfileプロジェクトの開発において、Claudeが効率的で安全な開発を行うための指示書です。

## プロジェクト概要

### アーキテクチャ
- **技術スタック**: HTML、CSS、JavaScript のみ（フレームワーク不使用）
- **構造**: 各ツールが独立したディレクトリに配置
- **デザイン**: 統一された緑色のカラーテーマとカードベースのレイアウト

### ディレクトリ構造
```
/
├── index.html              # メインページ
├── style.css              # 共通スタイル
├── [tool-name]/           # 各ツールのディレクトリ
│   ├── index.html         # ツールのメインページ
│   ├── script.js          # ツールのロジック
│   └── style.css          # ツール固有のスタイル
```

### カテゴリシステム
- `data-conversion`: データ変換ツール
- `dev-tools`: 開発者向けツール
- `security-network`: セキュリティ・ネットワーク関連
- `time-date`: 時間・日付関連
- `mini-games`: ミニゲーム
- `design-others`: デザイン・その他

## 開発ガイドライン

### 新機能追加時の必須要件
1. **デザイン統一**: 他のページのデザインに合わせること
2. **リンク追加**: トップページに新しく作成したページのリンクを追加すること
3. **フィルタ更新**: トップページのカテゴリフィルタ機能を更新すること

### ファイル構造の規則
```html
<!-- 各ツールのindex.htmlの基本構造 -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[ツール名]</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>[ツール名]</h1>
        <p>[ツールの説明]</p>
    </header>
    
    <nav>
        <ul>
            <li><a href="../index.html">ホーム</a></li>
        </ul>
    </nav>
    
    <main>
        <!-- ツール固有のコンテンツ -->
    </main>
    
    <script src="script.js"></script>
</body>
</html>
```

### デザインの統一性
- **カラーテーマ**: 緑色ベース (`#43a047`, `#66bb6a`, `#4caf50`)
- **フォント**: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- **レイアウト**: カードベースのデザイン、最大幅1200px
- **レスポンシブ**: モバイル対応必須

## セキュリティ・ベストプラクティス

### 入力検証
- **必須**: 全てのユーザー入力に対して適切な検証を実装
- **XSS対策**: HTMLエスケープ、DOM操作時の適切な処理
- **CSRFトークン**: 必要に応じて実装（ただし、このプロジェクトはクライアントサイドのみ）

### 安全なコーディング
```javascript
// 良い例: HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 悪い例: 直接HTMLを挿入
element.innerHTML = userInput; // XSS脆弱性

// 良い例: 安全なDOM操作
element.textContent = userInput;
```

### データ処理
- **クライアントサイド処理**: 全てのデータ処理はクライアントサイドで実行
- **データ保存禁止**: ユーザーデータをサーバーに保存しない
- **一時データ**: 必要に応じてlocalStorageやsessionStorageを使用

### エラーハンドリング
```javascript
// 適切なエラーハンドリング
try {
    const result = processUserInput(input);
    displayResult(result);
} catch (error) {
    console.error('処理エラー:', error);
    showErrorMessage('入力データに問題があります。');
}
```

## 新機能実装プロセス

### 1. ツールディレクトリの作成
```bash
mkdir [tool-name]
cd [tool-name]
touch index.html script.js style.css
```

### 2. 基本ファイルの実装
- `index.html`: 基本構造とナビゲーション
- `script.js`: ツールのロジック
- `style.css`: ツール固有のスタイル

### 3. メインページの更新
トップページ（`index.html`）に以下を追加：

```html
<!-- tool-cardの追加 -->
<div class="tool-card" data-category="[適切なカテゴリ]">
    <h2>[ツール名]</h2>
    <p>[詳細な説明]</p>
    <p>特徴：</p>
    <ul>
        <li>[特徴1]</li>
        <li>[特徴2]</li>
    </ul>
    <p>使用方法：</p>
    <ol>
        <li>[手順1]</li>
        <li>[手順2]</li>
    </ol>
    <a href="./[tool-name]/index.html">ツールを使用する</a>
</div>
```

### 4. フィルタ機能の確認
- カテゴリが正しく設定されているか確認
- フィルタリングが正常に動作するかテスト

## テスト・品質保証

### 手動テスト項目
- [ ] 基本機能の動作確認
- [ ] エラーケースの処理確認
- [ ] レスポンシブデザインの確認
- [ ] 複数ブラウザでの動作確認（Chrome、Firefox、Safari、Edge）

### パフォーマンス
- 大きなファイルの処理時のメモリ使用量
- 長時間の処理に対するユーザーフィードバック
- 不要なDOM操作の最適化

### アクセシビリティ
- キーボードナビゲーション
- スクリーンリーダー対応
- 適切な色のコントラスト
- 代替テキストの提供

## コードレビューチェックリスト

### 機能性
- [ ] 仕様通りに動作するか
- [ ] エラーハンドリングが適切か
- [ ] パフォーマンスに問題がないか

### セキュリティ
- [ ] XSS対策が実装されているか
- [ ] 入力検証が適切か
- [ ] 機密情報の漏洩がないか

### 品質
- [ ] コードが読みやすいか
- [ ] 適切なコメントが付いているか
- [ ] HTMLの構造が適切か
- [ ] CSSが整理されているか

### 統合
- [ ] デザインが統一されているか
- [ ] ナビゲーションが正しく設定されているか
- [ ] メインページのリンクが追加されているか
- [ ] カテゴリフィルタが正しく動作するか

## 制約事項

### 技術的制約
- **HTML/CSS/JavaScript のみ**: フレームワークやライブラリの使用禁止
- **クライアントサイド処理**: サーバーサイド処理は行わない
- **ブラウザ互換性**: モダンブラウザでの動作を保証

### 開発フロー
- **プルリクエスト必須**: 全ての変更はプルリクエストを通して行う
- **レビュー必須**: コードレビューを経てからマージする
- **テスト実施**: 本番環境への反映前に十分なテストを行う

## 推奨ツール・リソース

### 開発ツール
- **エディタ**: VS Code、WebStorm等
- **デバッグ**: ブラウザのデベロッパーツール
- **テスト**: 手動テスト、クロスブラウザテスト

### 参考リソース
- [MDN Web Docs](https://developer.mozilla.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

## 緊急時の対応

### セキュリティ問題発見時
1. 即座に問題のあるコードを無効化
2. 影響範囲の調査
3. 修正と再テスト
4. 再デプロイ

### バグ発生時
1. 問題の再現と影響範囲の確認
2. 優先度の判定
3. 修正の実装
4. テストとレビュー
5. デプロイ

---

このガイドラインに従って、安全で一貫性のある開発を行ってください。