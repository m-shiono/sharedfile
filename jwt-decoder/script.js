class JWTDecoder {
    constructor() {
        this.jwtInput = document.getElementById('jwtInput');
        this.headerOutput = document.getElementById('headerOutput');
        this.payloadOutput = document.getElementById('payloadOutput');
        this.signatureOutput = document.getElementById('signatureOutput');
        this.statusBar = document.getElementById('statusBar');
        this.claimsInfo = document.getElementById('claimsInfo');
        
        this.decodeBtn = document.getElementById('decodeBtn');
        this.validateBtn = document.getElementById('validateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyHeaderBtn = document.getElementById('copyHeaderBtn');
        this.copyPayloadBtn = document.getElementById('copyPayloadBtn');
        this.copySignatureBtn = document.getElementById('copySignatureBtn');
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.decodeBtn.addEventListener('click', () => this.decodeJWT());
        this.validateBtn.addEventListener('click', () => this.validateJWT());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyHeaderBtn.addEventListener('click', () => this.copyOutput(this.headerOutput));
        this.copyPayloadBtn.addEventListener('click', () => this.copyOutput(this.payloadOutput));
        this.copySignatureBtn.addEventListener('click', () => this.copyOutput(this.signatureOutput));
        
        this.jwtInput.addEventListener('input', () => this.clearStatus());
        this.jwtInput.addEventListener('paste', () => {
            setTimeout(() => this.autoProcess(), 100);
        });
    }
    
    showStatus(message, type = 'info') {
        showStatus(this.statusBar, message, type);
    }
    
    clearStatus() {
        this.statusBar.textContent = '';
        this.statusBar.className = 'status-bar';
    }
    
    clearAll() {
        this.jwtInput.value = '';
        this.headerOutput.value = '';
        this.payloadOutput.value = '';
        this.signatureOutput.value = '';
        this.claimsInfo.textContent = '';
        this.clearStatus();
        this.jwtInput.focus();
    }
    
    decodeJWT() {
        const token = this.jwtInput.value.trim();
        
        if (!token) {
            this.showStatus('JWTトークンを入力してください', 'error');
            return;
        }
        
        try {
            const parts = this.parseJWT(token);
            this.displayJWTParts(parts);
            this.displayClaims(parts.payload);
            this.showStatus('JWTのデコードが完了しました', 'success');
        } catch (error) {
            this.showStatus(`デコードエラー: ${error.message}`, 'error');
            this.clearOutputs();
        }
    }
    
    validateJWT() {
        const token = this.jwtInput.value.trim();
        
        if (!token) {
            this.showStatus('JWTトークンを入力してください', 'error');
            return;
        }
        
        try {
            const parts = this.parseJWT(token);
            const validation = this.validateJWTStructure(parts);
            
            if (validation.isValid) {
                this.displayJWTParts(parts);
                this.displayClaims(parts.payload);
                this.showStatus(`有効なJWTです。${validation.message}`, 'success');
            } else {
                this.showStatus(`無効なJWT: ${validation.message}`, 'error');
            }
        } catch (error) {
            this.showStatus(`バリデーションエラー: ${error.message}`, 'error');
            this.clearOutputs();
        }
    }
    
    parseJWT(token) {
        const parts = token.split('.');
        
        if (parts.length !== 3) {
            throw new Error('JWTは3つの部分（header.payload.signature）で構成される必要があります');
        }
        
        try {
            const header = JSON.parse(this.base64UrlDecode(parts[0]));
            const payload = JSON.parse(this.base64UrlDecode(parts[1]));
            const signature = parts[2];
            
            return {
                header,
                payload,
                signature,
                raw: {
                    header: parts[0],
                    payload: parts[1],
                    signature: parts[2]
                }
            };
        } catch (error) {
            throw new Error('JWTの形式が正しくありません。Base64URL形式である必要があります');
        }
    }
    
    base64UrlDecode(str) {
        // Base64URL to Base64
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        
        // Add padding if needed
        while (str.length % 4) {
            str += '=';
        }
        
        try {
            return decodeURIComponent(atob(str).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        } catch (error) {
            throw new Error('Base64URLデコードに失敗しました');
        }
    }
    
    validateJWTStructure(parts) {
        const issues = [];
        
        // Header validation
        if (!parts.header.alg) {
            issues.push('ヘッダーにalgフィールドがありません');
        }
        
        if (!parts.header.typ || parts.header.typ.toLowerCase() !== 'jwt') {
            issues.push('ヘッダーのtypフィールドがJWTではありません');
        }
        
        // Payload validation
        const now = Math.floor(Date.now() / 1000);
        
        if (parts.payload.exp && parts.payload.exp < now) {
            issues.push('トークンの有効期限が切れています');
        }
        
        if (parts.payload.nbf && parts.payload.nbf > now) {
            issues.push('トークンはまだ有効ではありません（nbf）');
        }
        
        if (parts.payload.iat && parts.payload.iat > now) {
            issues.push('発行日時が未来になっています');
        }
        
        const isValid = issues.length === 0;
        const message = isValid ? 
            '構造と基本的なクレームが有効です' : 
            issues.join('、');
        
        return { isValid, message, issues };
    }
    
    displayJWTParts(parts) {
        this.headerOutput.value = JSON.stringify(parts.header, null, 2);
        this.payloadOutput.value = JSON.stringify(parts.payload, null, 2);
        this.signatureOutput.value = parts.signature;
    }
    
    displayClaims(payload) {
        this.claimsInfo.textContent = '';
        
        const standardClaims = {
            'iss': 'Issuer（発行者）',
            'sub': 'Subject（主体）',
            'aud': 'Audience（対象者）',
            'exp': 'Expiration Time（有効期限）',
            'nbf': 'Not Before（有効開始時刻）',
            'iat': 'Issued At（発行時刻）',
            'jti': 'JWT ID（トークンID）'
        };
        
        const now = Math.floor(Date.now() / 1000);
        
        // Standard claims first
        Object.keys(standardClaims).forEach(claim => {
            if (payload.hasOwnProperty(claim)) {
                const claimDiv = document.createElement('div');
                claimDiv.className = 'claim-item';
                
                const labelDiv = document.createElement('div');
                labelDiv.className = 'claim-label';
                labelDiv.textContent = `${claim}:`;
                
                const valueDiv = document.createElement('div');
                valueDiv.className = 'claim-value';
                
                let value = payload[claim];
                let extraClass = '';
                
                // Format timestamp claims
                if (['exp', 'nbf', 'iat'].includes(claim) && typeof value === 'number') {
                    const date = new Date(value * 1000);
                    const formatted = date.toLocaleString('ja-JP');
                    value = `${value} (${formatted})`;
                    
                    if (claim === 'exp') {
                        if (value < now) {
                            extraClass = 'expiry-expired';
                            value += ' - 期限切れ';
                        } else if (value - now < 3600) { // 1 hour
                            extraClass = 'expiry-warning';
                            value += ' - まもなく期限切れ';
                        } else {
                            extraClass = 'expiry-valid';
                            value += ' - 有効';
                        }
                    }
                }
                
                valueDiv.textContent = typeof value === 'object' ? JSON.stringify(value) : value;
                if (extraClass) valueDiv.className += ` ${extraClass}`;
                
                // Add description
                const descDiv = document.createElement('div');
                descDiv.style.fontSize = '12px';
                descDiv.style.color = '#666';
                descDiv.style.marginTop = '2px';
                descDiv.textContent = standardClaims[claim];
                
                claimDiv.appendChild(labelDiv);
                claimDiv.appendChild(valueDiv);
                valueDiv.appendChild(descDiv);
                
                this.claimsInfo.appendChild(claimDiv);
            }
        });
        
        // Custom claims
        Object.keys(payload).forEach(claim => {
            if (!standardClaims.hasOwnProperty(claim)) {
                const claimDiv = document.createElement('div');
                claimDiv.className = 'claim-item';
                
                const labelDiv = document.createElement('div');
                labelDiv.className = 'claim-label';
                labelDiv.textContent = `${claim}:`;
                
                const valueDiv = document.createElement('div');
                valueDiv.className = 'claim-value';
                
                const value = payload[claim];
                valueDiv.textContent = typeof value === 'object' ? JSON.stringify(value) : value;
                
                // Add custom claim description
                const descDiv = document.createElement('div');
                descDiv.style.fontSize = '12px';
                descDiv.style.color = '#666';
                descDiv.style.marginTop = '2px';
                descDiv.textContent = 'カスタムクレーム';
                
                claimDiv.appendChild(labelDiv);
                claimDiv.appendChild(valueDiv);
                valueDiv.appendChild(descDiv);
                
                this.claimsInfo.appendChild(claimDiv);
            }
        });
        
        if (Object.keys(payload).length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.style.color = '#666';
            emptyMessage.style.fontStyle = 'italic';
            emptyMessage.textContent = 'クレームが見つかりません';
            this.claimsInfo.appendChild(emptyMessage);
        }
    }
    
    clearOutputs() {
        this.headerOutput.value = '';
        this.payloadOutput.value = '';
        this.signatureOutput.value = '';
        this.claimsInfo.textContent = '';
    }
    
    copyOutput(textarea) {
        copyToClipboard(textarea.value, (message, type) => this.showStatus(message, type));
    }
    
    autoProcess() {
        const token = this.jwtInput.value.trim();
        if (token && this.isValidJWTFormat(token)) {
            this.decodeJWT();
        }
    }
    
    isValidJWTFormat(token) {
        const parts = token.split('.');
        return parts.length === 3;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new JWTDecoder();
    
    const jwtInput = document.getElementById('jwtInput');
    jwtInput.placeholder = `JWT トークンを入力してください...

例:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuaLoOeUsOWkquihjiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjQyNjIyfQ.6yD7hhvSz6PiXjnJNrQ8z6hc-vnGn3F1I0M0bz1NmD4

このツールの特徴:
• JWT の3つの部分（Header、Payload、Signature）を分離表示
• 標準クレーム（iss、sub、aud、exp等）の説明表示
• 有効期限チェック機能
• カスタムクレームの識別
• 構造バリデーション`;
});