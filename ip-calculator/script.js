class IPCalculator {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.calculateBtn.click(); // 初期値での計算
    }

    bindEvents() {
        this.ipInput = document.getElementById('ipInput');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.statusBar = document.getElementById('statusBar');
        this.baseNetwork = document.getElementById('baseNetwork');
        this.subnetCount = document.getElementById('subnetCount');
        this.subnetCalculateBtn = document.getElementById('subnetCalculateBtn');
        this.subnetResults = document.getElementById('subnetResults');

        this.calculateBtn.addEventListener('click', () => this.calculate());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.subnetCalculateBtn.addEventListener('click', () => this.calculateSubnets());
        this.ipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calculate();
        });
    }

    showStatus(message, type = 'info') {
        if (this.statusBar) {
            this.statusBar.textContent = message;
            this.statusBar.className = `status-bar ${type}`;
            this.statusBar.style.display = 'block';
        }
    }

    validateIPAddress(ip) {
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        
        for (const part of parts) {
            const num = parseInt(part, 10);
            if (isNaN(num) || num < 0 || num > 255) return false;
        }
        return true;
    }

    parseCIDR(cidr) {
        const parts = cidr.split('/');
        if (parts.length !== 2) {
            throw new Error('CIDR記法が正しくありません (例: 192.168.1.0/24)');
        }

        const ip = parts[0];
        const prefix = parseInt(parts[1], 10);

        if (!this.validateIPAddress(ip)) {
            throw new Error('IPアドレスが無効です');
        }

        if (isNaN(prefix) || prefix < 0 || prefix > 32) {
            throw new Error('プレフィックス長が無効です (0-32)');
        }

        return { ip, prefix };
    }

    ipToInt(ip) {
        return ip.split('.').reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0) >>> 0;
    }

    intToIp(int) {
        return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
    }

    getSubnetMask(prefix) {
        const mask = (0xffffffff << (32 - prefix)) >>> 0;
        return this.intToIp(mask);
    }

    getIPClass(ip) {
        const firstOctet = parseInt(ip.split('.')[0], 10);
        if (firstOctet >= 1 && firstOctet <= 126) return 'A';
        if (firstOctet >= 128 && firstOctet <= 191) return 'B';
        if (firstOctet >= 192 && firstOctet <= 223) return 'C';
        if (firstOctet >= 224 && firstOctet <= 239) return 'D (マルチキャスト)';
        if (firstOctet >= 240 && firstOctet <= 255) return 'E (実験用)';
        return '不明';
    }

    isPrivateIP(ip) {
        const parts = ip.split('.').map(part => parseInt(part, 10));
        const [a, b, c, d] = parts;
        
        // 10.0.0.0/8
        if (a === 10) return true;
        
        // 172.16.0.0/12
        if (a === 172 && b >= 16 && b <= 31) return true;
        
        // 192.168.0.0/16
        if (a === 192 && b === 168) return true;
        
        // 127.0.0.0/8 (ループバック)
        if (a === 127) return true;
        
        return false;
    }

    calculate() {
        try {
            const input = this.ipInput.value.trim();
            if (!input) {
                this.showStatus('IPアドレス/CIDRを入力してください', 'error');
                return;
            }

            const { ip, prefix } = this.parseCIDR(input);
            const ipInt = this.ipToInt(ip);
            const subnetMask = this.getSubnetMask(prefix);
            const maskInt = this.ipToInt(subnetMask);
            
            const networkInt = ipInt & maskInt;
            const broadcastInt = networkInt | (~maskInt >>> 0);
            
            const networkAddress = this.intToIp(networkInt);
            const broadcastAddress = this.intToIp(broadcastInt);
            
            const totalHosts = Math.pow(2, 32 - prefix);
            const availableHosts = totalHosts > 2 ? totalHosts - 2 : 0;
            
            const firstUsableInt = networkInt + 1;
            const lastUsableInt = broadcastInt - 1;
            const ipRange = totalHosts > 2 ? `${this.intToIp(firstUsableInt)} - ${this.intToIp(lastUsableInt)}` : 'なし';
            
            // 結果を表示
            document.getElementById('networkAddress').textContent = networkAddress;
            document.getElementById('broadcastAddress').textContent = broadcastAddress;
            document.getElementById('subnetMask').textContent = subnetMask;
            document.getElementById('ipRange').textContent = ipRange;
            document.getElementById('totalHosts').textContent = totalHosts.toLocaleString();
            document.getElementById('availableHosts').textContent = availableHosts.toLocaleString();
            document.getElementById('ipClass').textContent = this.getIPClass(ip);
            document.getElementById('privateAddress').textContent = this.isPrivateIP(ip) ? 'はい' : 'いいえ';
            
            this.showStatus('計算完了', 'success');
        } catch (error) {
            this.showStatus(error.message, 'error');
        }
    }

    clear() {
        this.ipInput.value = '';
        this.baseNetwork.value = '';
        this.subnetCount.value = '4';
        this.subnetResults.innerHTML = '';
        
        // 結果をクリア
        const results = ['networkAddress', 'broadcastAddress', 'subnetMask', 'ipRange', 'totalHosts', 'availableHosts', 'ipClass', 'privateAddress'];
        results.forEach(id => {
            document.getElementById(id).textContent = '-';
        });
        
        this.showStatus('クリア完了', 'success');
    }

    calculateSubnets() {
        try {
            const baseInput = this.baseNetwork.value.trim();
            const subnetCountValue = parseInt(this.subnetCount.value, 10);
            
            if (!baseInput) {
                this.showStatus('ベースネットワークを入力してください', 'error');
                return;
            }
            
            if (isNaN(subnetCountValue) || subnetCountValue < 2 || subnetCountValue > 256) {
                this.showStatus('サブネット数は2〜256で入力してください', 'error');
                return;
            }
            
            const { ip, prefix } = this.parseCIDR(baseInput);
            const bitsNeeded = Math.ceil(Math.log2(subnetCountValue));
            const newPrefix = prefix + bitsNeeded;
            
            if (newPrefix > 32) {
                this.showStatus('指定されたサブネット数では分割できません', 'error');
                return;
            }
            
            const baseInt = this.ipToInt(ip);
            const baseMask = this.ipToInt(this.getSubnetMask(prefix));
            const networkInt = baseInt & baseMask;
            
            const subnetSize = Math.pow(2, 32 - newPrefix);
            const availableSubnets = Math.pow(2, bitsNeeded);
            
            let html = `<div class="subnet-item">
                <h3>分割情報</h3>
                <p>ベースネットワーク: ${this.intToIp(networkInt)}/${prefix}</p>
                <p>新しいプレフィックス: /${newPrefix}</p>
                <p>サブネットあたりのホスト数: ${subnetSize.toLocaleString()}</p>
                <p>利用可能なサブネット数: ${availableSubnets}</p>
            </div>`;
            
            for (let i = 0; i < Math.min(subnetCountValue, availableSubnets); i++) {
                const subnetNetworkInt = networkInt + (i * subnetSize);
                const subnetBroadcastInt = subnetNetworkInt + subnetSize - 1;
                const subnetNetworkAddress = this.intToIp(subnetNetworkInt);
                const subnetBroadcastAddress = this.intToIp(subnetBroadcastInt);
                const firstUsable = this.intToIp(subnetNetworkInt + 1);
                const lastUsable = this.intToIp(subnetBroadcastInt - 1);
                
                html += `<div class="subnet-item">
                    <h3>サブネット ${i + 1}</h3>
                    <p>ネットワーク: ${subnetNetworkAddress}/${newPrefix}</p>
                    <p>ブロードキャスト: ${subnetBroadcastAddress}</p>
                    <p>利用可能範囲: ${firstUsable} - ${lastUsable}</p>
                    <p>利用可能ホスト数: ${(subnetSize - 2).toLocaleString()}</p>
                </div>`;
            }
            
            this.subnetResults.innerHTML = html;
            this.showStatus('サブネット計算完了', 'success');
        } catch (error) {
            this.showStatus(error.message, 'error');
        }
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new IPCalculator();
});