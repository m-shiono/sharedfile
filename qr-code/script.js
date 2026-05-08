// QRコードのパディング設定
const QR_CODE_PADDING = 10;

const qrcodeCanvas = document.getElementById("qrcodeCanvas");
const generateQrCodeButton = document.getElementById("generateQrCode");
const printQrCodeButton = document.getElementById("printQrCode");
const resetButton = document.getElementById("reset");
const errorDiv = document.getElementById("error");
const colorButtons = document.querySelectorAll(".color-btn");
const customColorInput = document.getElementById("customColor");
const logoUrlInput = document.getElementById("logo-url");

// 印刷用要素
const printTitleInput = document.getElementById("print-title");
const printMessageInput = document.getElementById("print-message");
const printDisplayTitle = document.getElementById("print-display-title");
const printDisplayMessage = document.getElementById("print-display-message");
const printDisplayQrCode = document.getElementById("print-display-qrcode");

// フォーム要素の取得
const qrTypeRadios = document.getElementsByName("qr-type");
const typeForms = document.querySelectorAll(".type-form");

// 各フォームの入力フィールド
const textInput = document.getElementById("text");
const wifiSsid = document.getElementById("wifi-ssid");
const wifiPassword = document.getElementById("wifi-password");
const wifiEncryption = document.getElementById("wifi-encryption");
const contactName = document.getElementById("contact-name");
const contactTel = document.getElementById("contact-tel");
const contactEmail = document.getElementById("contact-email");

// 選択されたQRコードの色
let selectedQrColor = "#000000";

// 初期状態ではキャンバスを非表示
qrcodeCanvas.style.display = "none";

// タイプ切り替えイベント
qrTypeRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
        const selectedType = e.target.value;
        typeForms.forEach(form => {
            form.style.display = form.id === `${selectedType}-form` ? "block" : "none";
        });
        errorDiv.textContent = "";
        qrcodeCanvas.style.display = "none";
    });
});

generateQrCodeButton.addEventListener("click", () => {
    let qrValue = "";
    const selectedType = document.querySelector('input[name="qr-type"]:checked').value;

    if (selectedType === "text") {
        const text = textInput.value.trim();
        if (text === "") {
            errorDiv.textContent = "テキストを入力してください。";
            qrcodeCanvas.style.display = "none";
            return;
        }
        qrValue = text;
    } else if (selectedType === "wifi") {
        const ssid = wifiSsid.value.trim();
        const pass = wifiPassword.value.trim();
        const enc = wifiEncryption.value;
        
        if (ssid === "") {
            errorDiv.textContent = "ネットワーク名 (SSID) を入力してください。";
            qrcodeCanvas.style.display = "none";
            return;
        }
        // WIFI:S:<SSID>;T:<TYPE>;P:<PASSWORD>;;
        qrValue = `WIFI:S:${ssid};T:${enc};P:${pass};;`;
    } else if (selectedType === "contact") {
        const name = contactName.value.trim();
        const tel = contactTel.value.trim();
        const email = contactEmail.value.trim();

        if (name === "" && tel === "" && email === "") {
            errorDiv.textContent = "名前、電話番号、メールアドレスのいずれかを入力してください。";
            qrcodeCanvas.style.display = "none";
            return;
        }
        // MECARD:N:<NAME>;TEL:<TEL>;EMAIL:<EMAIL>;;
        qrValue = `MECARD:N:${name};TEL:${tel};EMAIL:${email};;`;
    }

    errorDiv.textContent = "";
    qrcodeCanvas.style.display = "block";

    try {
        if (typeof QRious === 'undefined') {
            throw new Error('QRiousライブラリが読み込まれていません');
        }
        
        const qr = new QRious({
            element: qrcodeCanvas,
            value: qrValue,
            size: 400,
            level: "H",
            background: 'white',
            foreground: selectedQrColor,
            padding: QR_CODE_PADDING
        });

        // ロゴの合成処理（URLがある場合のみ）
        const logoUrl = logoUrlInput.value.trim();
        if (logoUrl !== "") {
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous"; // CORS対応
            logoImg.src = logoUrl;
            
            logoImg.onload = () => {
                const ctx = qrcodeCanvas.getContext("2d");
                const logoSize = 80; // ロゴのサイズ（400pxの20%）
                const x = (qrcodeCanvas.width - logoSize) / 2;
                const y = (qrcodeCanvas.height - logoSize) / 2;
                
                // ロゴの背景に白い枠を描画（可読性向上）
                ctx.fillStyle = "white";
                ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
                
                // ロゴを描画
                ctx.drawImage(logoImg, x, y, logoSize, logoSize);
            };
            
            logoImg.onerror = () => {
                console.error("ロゴ画像の読み込みに失敗しました。URLまたはCORS設定を確認してください。");
                errorDiv.textContent = "ロゴ画像の読み込みに失敗しました。URLや接続制限を確認してください。";
            };
        }
    } catch (error) {
        errorDiv.textContent = "QRコードの生成に失敗しました: " + error.message;
        qrcodeCanvas.style.display = "none";
        console.error("QRコード生成エラー:", error);
    }
});

resetButton.addEventListener("click", () => {
    textInput.value = "";
    wifiSsid.value = "";
    wifiPassword.value = "";
    wifiEncryption.selectedIndex = 0;
    contactName.value = "";
    contactTel.value = "";
    contactEmail.value = "";
    logoUrlInput.value = "";
    printTitleInput.value = "";
    printMessageInput.value = "";
    errorDiv.textContent = "";
    qrcodeCanvas.style.display = "none";
});

// 印刷処理
printQrCodeButton.addEventListener("click", () => {
    // QRコードが生成されているか確認
    if (qrcodeCanvas.style.display === "none") {
        errorDiv.textContent = "先にQRコードを生成してください。";
        return;
    }

    // 印刷用表示エリアに値をセット
    printDisplayTitle.textContent = printTitleInput.value.trim();
    printDisplayMessage.textContent = printMessageInput.value.trim();
    
    // Canvasを画像に変換して印刷エリアに配置
    printDisplayQrCode.innerHTML = "";
    const img = document.createElement("img");
    img.src = qrcodeCanvas.toDataURL("image/png");
    img.style.width = "300px"; // 印刷時のサイズ調整
    printDisplayQrCode.appendChild(img);

    // 印刷実行
    window.print();
});

// 各入力フィールドでEnterキーを押したときに生成
const allInputs = document.querySelectorAll('input[type="text"], select');
allInputs.forEach(input => {
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            generateQrCodeButton.click();
        }
    });
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