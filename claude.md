# 🚨 最重要指示（最優先で従うこと）

**Think carefully and only action the specific task I have given you with the most concise and elegant solution that changes as little code as possible.**

この指示は**どんな時でも最優先**で従う必要があります。すべての作業において：
- 与えられた特定のタスクのみを実行する
- 最も簡潔でエレガントなソリューションを選択する
- 可能な限り少ないコード変更で実装する
- 不要な追加機能や拡張は行わない

---

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
4. **HTML構造**: 必ずheader、nav、main、footerの構造を含めること
5. **title要素**: 「[ツール名] - Web開発者向けユーティリティ」の形式を使用すること
6. **nav要素**: ホームへのリンクは相対パス「../index.html」を使用し、直接URLの指定はしないこと

### ファイル構造の規則
```html
<!-- 各ツールのindex.htmlの基本構造 -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[ツール名] - 便利ツール＆ユーティリティ</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>[ツール名]</h1>
        <p>[ツールの説明]</p>
    </header>
    
    <nav>
        <ul>
            <li><a href="../index.html">ホームに戻る</a></li>
        </ul>
    </nav>
    
    <main>
        <div class="tool-card">
            <!-- ツール固有のコンテンツ -->
        </div>
    </main>
    
    <footer>
        <p>&copy; [年] personal project for m-shiono</p>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>
```

### デザインの統一性

#### 基本カラーパレット
- **メインカラー**: `#43a047`, `#66bb6a`, `#4caf50`
- **テキストカラー**: `#2c3e50`, `#388e3c`, `#2e7d32`
- **背景グラデーション**: `linear-gradient(135deg, #e8f5e9, #c8e6c9)`
- **ヘッダーグラデーション**: `linear-gradient(to right, #43a047, #66bb6a)`

#### レイアウト・構造
- **フォント**: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- **最大幅**: 
    - メインコンテンツ: 1600px
    - ヘッダー、フッター: 1600px
- **パディング**: 2rem（デスクトップ）、1rem（モバイル）
- **カードデザイン**: 角丸12px、グラデーション背景、影付き

#### 具体的なスタイル指定

**ヘッダー**
```css
header {
    background: linear-gradient(to right, #43a047, #66bb6a);
    color: white;
    text-align: center;
    padding: 2rem 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}
```

**ナビゲーション**
```css
nav {
    background: linear-gradient(to right, #66bb6a, #81c784);
    padding: 1rem 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

nav ul li a {
    color: white;
    text-decoration: none;
    font-weight: bold;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    border-radius: 20px;
}

nav ul li a:hover {
    background-color: rgba(255,255,255,0.2);
    transform: translateY(-2px);
}

nav ul {
    justify-content: flex-start;
}
```

**tool-card**
```css
.tool-card {
    background: linear-gradient(135deg, #ffffff, #e8f5e9);
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    padding: 2rem;
    margin-bottom: 2rem;
    transition: all 0.3s ease;
}

.tool-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

.tool-card h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #2e7d32;
    border-bottom: 2px solid #4caf50;
    padding-bottom: 0.5rem;
}

.tool-card h3 {
    font-size: 1.4rem;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: #388e3c;
}
```

**ボタン**
```css
button {
    background: linear-gradient(to right, #4caf50, #45a049);
    color: white;
    padding: 0.7rem 1.5rem;
    border: none;
    border-radius: 25px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
}

button:hover {
    background: linear-gradient(to right, #45a049, #4caf50);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    transform: translateY(-2px);
}
```

**フォーム要素**
```css
textarea {
    width: 100%;
    height: 200px;
    padding: 0.5rem;
    border: 1px solid #81c784;
    border-radius: 4px;
    resize: vertical;
    margin-bottom: 1rem;
}

.radio-group {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.radio-group label {
    display: flex;
    align-items: center;
    cursor: pointer;
}
```

**フッター**
```css
footer {
    background: linear-gradient(to right, #43a047, #66bb6a);
    color: white;
    text-align: center;
    padding: 1rem 0;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
```

**レスポンシブデザイン**
```css
@media (max-width: 768px) {
    main {
        padding: 0 1rem;
    }
    .tool-card {
        padding: 1.5rem;
    }
    .radio-group {
        flex-direction: column;
    }
}
```

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
- `style.css`: ツール固有のスタイル（必須要素を含む）

#### style.cssの必須要素
各ツールの`style.css`ファイルには、以下の基本スタイルを必ず含めてください。
さらに、前述の「具体的なスタイル指定」セクションで定義されている**すべてのスタイル**（`header`, `nav`, `.tool-card`, `button`, `textarea`, `.radio-group`, `footer`, レスポンシブデザインなど）も追加する必要があります。

**`style.css` 基本テンプレート:**
```css
/* 基本リセット */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* body要素の統一スタイル */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #2c3e50;
    background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
    min-height: 100vh;
}

/*
 * ここに「具体的なスタイル指定」セクションの
 * CSSルール（header, nav, .tool-cardなど）をすべてコピーしてください。
 */
```

#### 注意事項
- **必須**: 全ての統一スタイルを各ツールのstyle.cssに含める
- **禁止**: 共通CSSファイルへの依存（各ツールは独立して動作すること）
- **推奨**: デザインの一貫性を保つため、色、フォント、レイアウトの数値は統一すること

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

### 作業時に守るべきルール
- **修正ファイルは必ずプッシュする**: コード修正や新規開発を行った場合はコードを確実にプッシュすること
- **プルリクエストのコメント**: プルリクエスト用のコメントを作成する場合は、必ず本文の最後の行に /gemini review の文字を入れること
- **エラー報告**: エラーなどでファイルが送信できない場合は、必ずその旨を報告すること
- **コードの一貫性**: 各ツールのコードは、プロジェクト全体のスタイルと一貫性を保つこと

### プロジェクトの制約
- **フレームワーク不使用**: HTML、CSS、JavaScriptのみを使用
- **サーバーサイド処理なし**: クライアントサイドで完結するツール
- **データ保存禁止**: ユーザーデータをサーバーに保存しない

### 技術的制約
- **HTML/CSS/JavaScript のみ**: フレームワークやライブラリの使用禁止
- **クライアントサイド処理**: サーバーサイド処理は行わない
- **ブラウザ互換性**: モダンブラウザでの動作を保証

### 開発フロー
- **プルリクエスト必須**: 全ての変更はプルリクエストを通して行う
- **レビュー必須**: コードレビューを経てからマージする
- **テスト実施**: 本番環境への反映前に十分なテストを行う

## セキュリティ・アクセシビリティのベストプラクティス
### セキュリティ
- **入力検証**: ユーザー入力は必ず検証し、サニタイズすること
- **XSS対策**: ユーザー入力を直接HTMLに挿入しないこと。`textContent`や`innerText`を使用すること
- **CSRF対策**: 必要に応じてCSRFトークンを実装すること（ただし、このプロジェクトはクライアントサイドのみ）
- **セキュアな通信**: HTTPSを使用し、データの盗聴を防ぐこと
- **セキュリティアップデート**: 使用するライブラリやツールのセキュリティアップデートを定期的に確認し、適用すること
- **エラーハンドリング**: エラー情報をユーザーに公開しないこと。ログに記録するのみとすること
- **セキュリティテスト**: 定期的にセキュリティテストを実施し、脆弱性をチェックすること
- **セキュリティレビュー**: 新機能追加時には必ずセキュリティレビューを行い、脆弱性がないか確認すること
- **セキュリティツールの使用**: 静的解析ツールや脆弱性スキャナーを使用して、コードのセキュリティをチェックすること
### アクセシビリティ
- **ARIA属性の使用**: 必要に応じてARIA属性を使用し、スクリーンリーダー対応を強化すること
- **キーボードナビゲーション**: 全ての機能はキーボードで操作可能にすること
- **フォームのラベル**: フォーム要素には必ずラベルを付け、アクセシビリティを向上させること
- **フォーカス管理**: フォーカスが移動する要素には明確な視覚的インジケーターを提供すること
- **テキストボックスの高さ**: テキストボックスの高さはサイズを統一して、ユーザーの視覚的な一貫性を保つこと
- **音声認識**: 音声入力をサポートする場合、音声コマンドの明確なガイドラインを提供すること
- **テストツールの使用**: アクセシビリティテストツール（例: Axe、WAVE）を使用して、コードのアクセシビリティをチェックすること

## 参考リソース・緊急時対応

### 参考リソース
- [MDN Web Docs](https://developer.mozilla.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

### 緊急時の対応
セキュリティ問題やバグ発生時は、以下の手順で対応してください。

**セキュリティ問題発見時**
1. 問題のあるコードを即座に無効化
2. 影響範囲の調査
3. 修正と再テスト
4. 再デプロイ

**バグ発生時**
1. 問題の再現と影響範囲の確認
2. 優先度の判定
3. 修正の実装
4. テストとレビュー
5. デプロイ

---

このガイドラインに従い、安全で一貫性のある開発を行ってください。
