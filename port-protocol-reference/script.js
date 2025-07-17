// Port/Protocol Reference Tool JavaScript

// Comprehensive port database
const portsData = [
    // Web Services
    { port: 80, service: "HTTP", protocol: "TCP", category: "web", description: "Hypertext Transfer Protocol - ウェブページの表示に使用", security: "low", securityNote: "暗号化されていないため、機密情報の送信には不適切" },
    { port: 443, service: "HTTPS", protocol: "TCP", category: "web", description: "HTTP over SSL/TLS - 暗号化されたウェブ通信", security: "low", securityNote: "暗号化されており、一般的に安全" },
    { port: 8080, service: "HTTP Alternate", protocol: "TCP", category: "web", description: "HTTPの代替ポート - 開発環境やプロキシサーバーで使用", security: "medium", securityNote: "管理画面等にアクセス可能な場合があるため注意" },
    { port: 8443, service: "HTTPS Alternate", protocol: "TCP", category: "web", description: "HTTPSの代替ポート", security: "medium", securityNote: "管理画面等にアクセス可能な場合があるため注意" },
    { port: 3000, service: "Development Server", protocol: "TCP", category: "web", description: "開発用Webサーバー（Node.js、React等）", security: "high", securityNote: "開発環境でのみ使用、本番環境では閉じること" },

    // Email Services
    { port: 25, service: "SMTP", protocol: "TCP", category: "email", description: "Simple Mail Transfer Protocol - メール送信", security: "medium", securityNote: "暗号化されていない場合、スパムリレーのリスクあり" },
    { port: 465, service: "SMTPS", protocol: "TCP", category: "email", description: "SMTP over SSL - 暗号化されたメール送信", security: "low", securityNote: "暗号化されており安全" },
    { port: 587, service: "SMTP Submission", protocol: "TCP", category: "email", description: "Mail Submission - クライアントからのメール送信", security: "low", securityNote: "認証とSTARTTLSを使用することで安全" },
    { port: 110, service: "POP3", protocol: "TCP", category: "email", description: "Post Office Protocol v3 - メール受信", security: "medium", securityNote: "暗号化されていない場合、認証情報が平文で送信される" },
    { port: 995, service: "POP3S", protocol: "TCP", category: "email", description: "POP3 over SSL - 暗号化されたメール受信", security: "low", securityNote: "暗号化されており安全" },
    { port: 143, service: "IMAP", protocol: "TCP", category: "email", description: "Internet Message Access Protocol - メール受信", security: "medium", securityNote: "暗号化されていない場合、認証情報が平文で送信される" },
    { port: 993, service: "IMAPS", protocol: "TCP", category: "email", description: "IMAP over SSL - 暗号化されたメール受信", security: "low", securityNote: "暗号化されており安全" },

    // File Transfer
    { port: 20, service: "FTP Data", protocol: "TCP", category: "file", description: "File Transfer Protocol - データ転送", security: "high", securityNote: "暗号化されておらず、認証情報が平文で送信される" },
    { port: 21, service: "FTP Control", protocol: "TCP", category: "file", description: "File Transfer Protocol - 制御接続", security: "high", securityNote: "暗号化されておらず、認証情報が平文で送信される" },
    { port: 22, service: "SSH/SFTP", protocol: "TCP", category: "file", description: "Secure Shell - 暗号化されたリモートアクセスとファイル転送", security: "low", securityNote: "暗号化されており安全、ただし強固な認証設定が必要" },
    { port: 990, service: "FTPS", protocol: "TCP", category: "file", description: "FTP over SSL - 暗号化されたファイル転送", security: "low", securityNote: "暗号化されており安全" },
    { port: 69, service: "TFTP", protocol: "UDP", category: "file", description: "Trivial File Transfer Protocol - 簡易ファイル転送", security: "high", securityNote: "認証機能がなく、機密ファイルの転送には不適切" },

    // Database
    { port: 3306, service: "MySQL", protocol: "TCP", category: "database", description: "MySQL Database Server", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 5432, service: "PostgreSQL", protocol: "TCP", category: "database", description: "PostgreSQL Database Server", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 1433, service: "MS SQL Server", protocol: "TCP", category: "database", description: "Microsoft SQL Server", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 1521, service: "Oracle DB", protocol: "TCP", category: "database", description: "Oracle Database", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 27017, service: "MongoDB", protocol: "TCP", category: "database", description: "MongoDB Database Server", security: "high", securityNote: "外部からのアクセスは制限し、認証を有効化" },
    { port: 6379, service: "Redis", protocol: "TCP", category: "database", description: "Redis Key-Value Store", security: "high", securityNote: "デフォルトで認証なし、必ず認証を設定" },

    // Network Services
    { port: 53, service: "DNS", protocol: "UDP/TCP", category: "network", description: "Domain Name System - ドメイン名解決", security: "medium", securityNote: "DNSキャッシュポイズニング攻撃のリスクあり" },
    { port: 67, service: "DHCP Server", protocol: "UDP", category: "network", description: "Dynamic Host Configuration Protocol - IPアドレス自動割当", security: "medium", securityNote: "不正なDHCPサーバーによる攻撃のリスクあり" },
    { port: 68, service: "DHCP Client", protocol: "UDP", category: "network", description: "DHCP Client - IPアドレス取得", security: "medium", securityNote: "DHCPサーバーの信頼性に依存" },
    { port: 123, service: "NTP", protocol: "UDP", category: "network", description: "Network Time Protocol - 時刻同期", security: "medium", securityNote: "時刻同期の改ざんによるセキュリティ影響あり" },
    { port: 161, service: "SNMP", protocol: "UDP", category: "network", description: "Simple Network Management Protocol - ネットワーク機器管理", security: "high", securityNote: "デフォルトコミュニティストリングは変更必須" },
    { port: 162, service: "SNMP Trap", protocol: "UDP", category: "network", description: "SNMP Trap - ネットワーク機器からの通知", security: "medium", securityNote: "機器情報の漏洩リスクあり" },

    // Security
    { port: 389, service: "LDAP", protocol: "TCP", category: "security", description: "Lightweight Directory Access Protocol - ディレクトリサービス", security: "medium", securityNote: "暗号化されていない場合、認証情報が平文で送信される" },
    { port: 636, service: "LDAPS", protocol: "TCP", category: "security", description: "LDAP over SSL - 暗号化されたディレクトリサービス", security: "low", securityNote: "暗号化されており安全" },
    { port: 88, service: "Kerberos", protocol: "TCP/UDP", category: "security", description: "Kerberos Authentication - 認証サービス", security: "low", securityNote: "強固な認証プロトコル" },
    { port: 1812, service: "RADIUS Auth", protocol: "UDP", category: "security", description: "Remote Authentication Dial-In User Service - 認証", security: "medium", securityNote: "共有秘密鍵の管理が重要" },
    { port: 1813, service: "RADIUS Accounting", protocol: "UDP", category: "security", description: "RADIUS Accounting - アカウンティング", security: "medium", securityNote: "共有秘密鍵の管理が重要" },

    // System Services
    { port: 23, service: "Telnet", protocol: "TCP", category: "system", description: "Telnet - リモート端末接続", security: "high", securityNote: "暗号化されておらず、SSHの使用を推奨" },
    { port: 135, service: "RPC Endpoint", protocol: "TCP", category: "system", description: "Microsoft RPC Endpoint Mapper", security: "high", securityNote: "Windowsの脆弱性攻撃に利用されやすい" },
    { port: 139, service: "NetBIOS", protocol: "TCP", category: "system", description: "NetBIOS Session Service", security: "high", securityNote: "古いプロトコル、SMBの使用を推奨" },
    { port: 445, service: "SMB", protocol: "TCP", category: "system", description: "Server Message Block - ファイル共有", security: "medium", securityNote: "最新バージョンの使用と適切な認証設定が必要" },
    { port: 3389, service: "RDP", protocol: "TCP", category: "system", description: "Remote Desktop Protocol - リモートデスクトップ", security: "medium", securityNote: "強固な認証とネットワーク制限が必要" },
    { port: 5900, service: "VNC", protocol: "TCP", category: "system", description: "Virtual Network Computing - リモートデスクトップ", security: "high", securityNote: "暗号化が弱く、より安全な代替手段を推奨" },

    // Other Common Ports
    { port: 79, service: "Finger", protocol: "TCP", category: "other", description: "Finger Protocol - ユーザー情報取得", security: "high", securityNote: "ユーザー情報が漏洩するため、通常は無効にする" },
    { port: 113, service: "Ident", protocol: "TCP", category: "other", description: "Identification Protocol - ユーザー識別", security: "medium", securityNote: "ユーザー情報の漏洩リスクあり" },
    { port: 119, service: "NNTP", protocol: "TCP", category: "other", description: "Network News Transfer Protocol - ニュース配信", security: "medium", securityNote: "適切なアクセス制御が必要" },
    { port: 194, service: "IRC", protocol: "TCP", category: "other", description: "Internet Relay Chat - チャット", security: "medium", securityNote: "マルウェアのC&Cチャネルとして悪用される場合あり" },
    { port: 220, service: "IMAP3", protocol: "TCP", category: "email", description: "Internet Message Access Protocol v3", security: "medium", securityNote: "IMAP4の使用を推奨" },
    
    // Additional Web/Application Ports
    { port: 8000, service: "HTTP Alternate", protocol: "TCP", category: "web", description: "HTTP代替ポート - 開発・テスト環境", security: "medium", securityNote: "本番環境では適切なアクセス制御が必要" },
    { port: 8888, service: "HTTP Alternate", protocol: "TCP", category: "web", description: "HTTP代替ポート - 管理画面等", security: "medium", securityNote: "管理機能へのアクセスに注意" },
    { port: 9000, service: "Application Server", protocol: "TCP", category: "web", description: "アプリケーションサーバー", security: "medium", securityNote: "適切な認証と暗号化が必要" },
    { port: 9090, service: "HTTP Alternate", protocol: "TCP", category: "web", description: "HTTP代替ポート - 管理・監視", security: "medium", securityNote: "管理機能へのアクセス制御が重要" },

    // Database Alternatives
    { port: 3307, service: "MySQL Alternate", protocol: "TCP", category: "database", description: "MySQL代替ポート", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 5433, service: "PostgreSQL Alt", protocol: "TCP", category: "database", description: "PostgreSQL代替ポート", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },

    // File Transfer Alternatives
    { port: 989, service: "FTPS Data", protocol: "TCP", category: "file", description: "FTPS データ転送", security: "low", securityNote: "暗号化されており安全" },
    { port: 2121, service: "FTP Alternate", protocol: "TCP", category: "file", description: "FTP代替ポート", security: "high", securityNote: "暗号化されておらず、SFTPやFTPSの使用を推奨" },

    // Network Management
    { port: 179, service: "BGP", protocol: "TCP", category: "network", description: "Border Gateway Protocol - ルーティング", security: "high", securityNote: "ネットワークルーティングの重要な機能、厳重な管理が必要" },
    { port: 546, service: "DHCPv6 Client", protocol: "UDP", category: "network", description: "DHCPv6 クライアント", security: "medium", securityNote: "IPv6環境でのアドレス設定" },
    { port: 547, service: "DHCPv6 Server", protocol: "UDP", category: "network", description: "DHCPv6 サーバー", security: "medium", securityNote: "IPv6環境でのアドレス配布" },

    // Additional System Services
    { port: 111, service: "RPC Portmapper", protocol: "TCP/UDP", category: "system", description: "RPC Port Mapper - RPC サービス検索", security: "high", securityNote: "攻撃者によるサービス列挙に利用される可能性" },
    { port: 512, service: "Rexec", protocol: "TCP", category: "system", description: "Remote Execution - リモート実行", security: "high", securityNote: "暗号化されておらず、非常に危険" },
    { port: 513, service: "Rlogin", protocol: "TCP", category: "system", description: "Remote Login - リモートログイン", security: "high", securityNote: "暗号化されておらず、SSHの使用を推奨" },
    { port: 514, service: "Rsh", protocol: "TCP", category: "system", description: "Remote Shell - リモートシェル", security: "high", securityNote: "暗号化されておらず、SSHの使用を推奨" },
    { port: 515, service: "LPD", protocol: "TCP", category: "system", description: "Line Printer Daemon - プリンタサービス", security: "medium", securityNote: "適切なアクセス制御が必要" },

    // VPN and Tunneling
    { port: 1723, service: "PPTP", protocol: "TCP", category: "security", description: "Point-to-Point Tunneling Protocol - VPN", security: "high", securityNote: "暗号化が弱く、より安全なVPNプロトコルを推奨" },
    { port: 1194, service: "OpenVPN", protocol: "UDP", category: "security", description: "OpenVPN - VPN接続", security: "low", securityNote: "適切に設定されていれば安全" },
    { port: 4500, service: "IPSec NAT-T", protocol: "UDP", category: "security", description: "IPSec NAT Traversal", security: "low", securityNote: "適切に設定されていれば安全" },
    { port: 500, service: "ISAKMP", protocol: "UDP", category: "security", description: "Internet Security Association and Key Management Protocol", security: "low", securityNote: "IPSecで使用、適切に設定されていれば安全" },

    // Monitoring and Management
    { port: 1984, service: "BigBrother", protocol: "TCP", category: "system", description: "システム監視", security: "medium", securityNote: "監視システムへのアクセス制御が重要" },
    { port: 2049, service: "NFS", protocol: "TCP/UDP", category: "file", description: "Network File System - ネットワークファイル共有", security: "medium", securityNote: "適切な認証とアクセス制御が必要" },
    { port: 5353, service: "mDNS", protocol: "UDP", category: "network", description: "Multicast DNS - ローカル名前解決", security: "medium", securityNote: "ローカルネットワーク内での情報漏洩リスク" },

    // Gaming and Streaming
    { port: 27015, service: "Steam", protocol: "TCP/UDP", category: "other", description: "Steam ゲームサーバー", security: "low", securityNote: "ゲーム用途、適切な設定で安全" },
    { port: 1935, service: "RTMP", protocol: "TCP", category: "other", description: "Real Time Messaging Protocol - ストリーミング", security: "medium", securityNote: "ストリーミング用途、適切な認証が必要" },

    // Additional Application Ports
    { port: 11211, service: "Memcached", protocol: "TCP/UDP", category: "database", description: "Memcached - メモリキャッシュ", security: "high", securityNote: "デフォルトで認証なし、外部アクセスを制限" },
    { port: 9200, service: "Elasticsearch", protocol: "TCP", category: "database", description: "Elasticsearch - 検索エンジン", security: "medium", securityNote: "適切な認証とアクセス制御が必要" },
    { port: 5672, service: "AMQP", protocol: "TCP", category: "other", description: "Advanced Message Queuing Protocol", security: "medium", securityNote: "メッセージキューイング、適切な認証が必要" },
    { port: 6667, service: "IRC", protocol: "TCP", category: "other", description: "Internet Relay Chat - 標準ポート", security: "medium", securityNote: "チャット用途、適切な管理が必要" }
];

// DOM elements
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const portsContainer = document.getElementById('portsContainer');

// State
let currentFilter = 'all';
let currentSearchTerm = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    displayPorts(portsData);
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', function() {
        currentSearchTerm = this.value.toLowerCase().trim();
        filterAndDisplayPorts();
    });

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter
            currentFilter = this.getAttribute('data-category');
            filterAndDisplayPorts();
        });
    });
}

// Filter and display ports based on current filter and search term
function filterAndDisplayPorts() {
    let filteredPorts = portsData;

    // Apply category filter
    if (currentFilter !== 'all') {
        filteredPorts = filteredPorts.filter(port => port.category === currentFilter);
    }

    // Apply search filter
    if (currentSearchTerm) {
        filteredPorts = filteredPorts.filter(port => {
            return port.port.toString().includes(currentSearchTerm) ||
                   port.service.toLowerCase().includes(currentSearchTerm) ||
                   port.protocol.toLowerCase().includes(currentSearchTerm) ||
                   port.description.toLowerCase().includes(currentSearchTerm);
        });
    }

    displayPorts(filteredPorts);
}

// Display ports in the container
function displayPorts(ports) {
    if (ports.length === 0) {
        portsContainer.innerHTML = '<div class="no-results">検索条件に一致するポートが見つかりませんでした。</div>';
        return;
    }

    // Sort ports by port number
    ports.sort((a, b) => a.port - b.port);

    const html = ports.map(port => createPortCard(port)).join('');
    portsContainer.innerHTML = html;
}

// Create HTML for a port card
function createPortCard(port) {
    const securityClass = `security-${port.security}`;
    const securityText = {
        'low': '低リスク',
        'medium': '中リスク',
        'high': '高リスク'
    }[port.security];

    const categoryText = {
        'web': 'Web',
        'email': 'Email',
        'file': 'File Transfer',
        'database': 'Database',
        'network': 'Network',
        'security': 'Security',
        'system': 'System',
        'other': 'その他'
    }[port.category];

    return `
        <div class="port-card">
            <div class="port-header">
                <div class="port-number">${port.port}</div>
                <div class="port-protocol">${port.protocol}</div>
            </div>
            <div class="port-service">${port.service}</div>
            <div class="port-description">${port.description}</div>
            <div class="port-category">${categoryText}</div>
            <div class="security-info ${securityClass}">
                <strong>セキュリティレベル: ${securityText}</strong><br>
                ${port.securityNote}
            </div>
        </div>
    `;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}