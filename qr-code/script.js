// QRコードのパディング設定
const QR_CODE_PADDING = 10;

const qrcodeCanvas = document.getElementById("qrcodeCanvas");
const textInput = document.getElementById("text");
const generateQrCodeButton = document.getElementById("generateQrCode");
const resetButton = document.getElementById("reset");
const errorDiv = document.getElementById("error");
const colorButtons = document.querySelectorAll(".color-btn");
const customColorInput = document.getElementById("customColor");

// 選択されたQRコードの色
let selectedQrColor = "#000000";

// 初期状態ではキャンバスを非表示
qrcodeCanvas.style.display = "none";

generateQrCodeButton.addEventListener("click", () => {
    const text = textInput.value.trim();

    if (text === "") {
        errorDiv.textContent = "テキストを入力してください。";
        qrcodeCanvas.style.display = "none";
        return;
    }

    errorDiv.textContent = "";
    qrcodeCanvas.style.display = "block";

    try {
        // QRiousが読み込まれたか確認
        if (typeof QRious === 'undefined') {
            throw new Error('QRiousライブラリが読み込まれていません');
        }
        
        const qrcode = new QRious({
            element: qrcodeCanvas,
            value: text,
            size: 400, // QRコードのサイズ
            level: "H", // エラー訂正レベル
            background: 'white',
            foreground: selectedQrColor, // 選択された色のQRコード
            padding: QR_CODE_PADDING // QRコード周囲の余白を調整
        });
    } catch (error) {
        errorDiv.textContent = "QRコードの生成に失敗しました: " + error.message;
        qrcodeCanvas.style.display = "none";
        console.error("QRコード生成エラー:", error);
    }
});

resetButton.addEventListener("click", () => {
    textInput.value = "";
    errorDiv.textContent = "";
    qrcodeCanvas.style.display = "none";
});

textInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        generateQrCodeButton.click();
    }
});

// カラーボタンのイベント設定
colorButtons.forEach(button => {
    button.addEventListener("click", function() {
        // アクティブクラスを全てのボタンから削除
        colorButtons.forEach(btn => btn.classList.remove("active"));
        // クリックされたボタンにアクティブクラスを追加
        this.classList.add("active");
        // 選択された色を更新
        selectedQrColor = this.getAttribute("data-color");
        // カスタムカラー入力も同期
        customColorInput.value = selectedQrColor;
        
        // 既にQRコードが生成されている場合は再生成
        if (qrcodeCanvas.style.display === "block") {
            generateQrCodeButton.click();
        }
    });
});

// カスタムカラー入力のイベント設定
customColorInput.addEventListener("input", function() {
    // 選択された色を更新
    selectedQrColor = this.value;
    // アクティブクラスを全てのボタンから削除
    colorButtons.forEach(btn => btn.classList.remove("active"));
    
    // 既にQRコードが生成されている場合は再生成
    if (qrcodeCanvas.style.display === "block") {
        generateQrCodeButton.click();
    }
});