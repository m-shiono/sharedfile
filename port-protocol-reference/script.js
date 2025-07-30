// Port/Protocol Reference Tool JavaScript

// 完全なWell Known Portsデータベース (0-1023)
const portsData = [
    // システムポート (0-9)
    { port: 0, service: "予約済み", protocol: "TCP/UDP", category: "system", description: "予約済みポート、通信には使用されない", security: "low", securityNote: "システム予約、セキュリティ上の影響なし" },
    { port: 1, service: "TCPMUX", protocol: "TCP", category: "system", description: "TCP Port Service Multiplexer", security: "medium", securityNote: "まれにしか使用されず、サービス列挙の可能性がある" },
    { port: 2, service: "Management Utility", protocol: "TCP/UDP", category: "system", description: "管理ユーティリティ", security: "medium", securityNote: "管理機能、アクセスを制限する" },
    { port: 3, service: "Compression Process", protocol: "TCP/UDP", category: "system", description: "圧縮プロセス", security: "medium", securityNote: "レガシーサービス、まれに使用される" },
    { port: 5, service: "RJE", protocol: "TCP/UDP", category: "system", description: "Remote Job Entry - リモートジョブエントリ", security: "high", securityNote: "レガシーサービス、潜在的なセキュリティリスク" },
    { port: 7, service: "Echo", protocol: "TCP/UDP", category: "network", description: "Echo Protocol - 受信データを返すプロトコル", security: "medium", securityNote: "偵察に使用される可能性があり、無効化を検討" },
    { port: 9, service: "Discard", protocol: "TCP/UDP", category: "network", description: "Discard Protocol - 受信データを破棄", security: "low", securityNote: "一般的に安全、テスト用途" },

    // 標準サービス (10-99)
    { port: 11, service: "Active Users", protocol: "TCP/UDP", category: "system", description: "Active Users (systat service) - アクティブユーザー", security: "high", securityNote: "システム情報を開示、無効化すべき" },
    { port: 13, service: "Daytime", protocol: "TCP/UDP", category: "network", description: "Daytime Protocol - 現在の日時を返す", security: "low", securityNote: "情報開示、軽微なリスク" },
    { port: 15, service: "Netstat", protocol: "TCP", category: "system", description: "Network Status - ネットワーク状態", security: "high", securityNote: "ネットワーク情報を開示、無効化すべき" },
    { port: 17, service: "QOTD", protocol: "TCP/UDP", category: "other", description: "Quote of the Day - 今日の格言", security: "low", securityNote: "一般的に無害、増幅攻撃に使用される可能性" },
    { port: 18, service: "MSP", protocol: "TCP/UDP", category: "other", description: "Message Send Protocol - メッセージ送信プロトコル", security: "medium", securityNote: "レガシーメッセージング、まれに使用" },
    { port: 19, service: "Chargen", protocol: "TCP/UDP", category: "network", description: "Character Generator Protocol - 文字生成プロトコル", security: "medium", securityNote: "DDoS増幅攻撃に使用される可能性、無効化を検討" },
    { port: 20, service: "FTP Data", protocol: "TCP", category: "file", description: "File Transfer Protocol - データ転送", security: "high", securityNote: "暗号化されておらず、認証情報が平文で送信される" },
    { port: 21, service: "FTP Control", protocol: "TCP", category: "file", description: "File Transfer Protocol - 制御接続", security: "high", securityNote: "暗号化されておらず、認証情報が平文で送信される" },
    { port: 22, service: "SSH", protocol: "TCP", category: "security", description: "Secure Shell - 暗号化されたリモートアクセス", security: "low", securityNote: "適切に設定されていれば安全、強固な認証が必要" },
    { port: 23, service: "Telnet", protocol: "TCP", category: "system", description: "Telnet - 暗号化されていないリモート端末", security: "high", securityNote: "暗号化されておらず、SSHの使用を推奨" },
    { port: 25, service: "SMTP", protocol: "TCP", category: "email", description: "Simple Mail Transfer Protocol - メール送信", security: "medium", securityNote: "設定ミスによりスパムリレーに悪用される可能性" },
    { port: 37, service: "Time", protocol: "TCP/UDP", category: "network", description: "Time Protocol - システム時刻を返す", security: "low", securityNote: "軽微な情報開示" },
    { port: 42, service: "Nameserver", protocol: "TCP/UDP", category: "network", description: "Host Name Server - ホスト名サーバー", security: "medium", securityNote: "レガシー名前解決サービス" },
    { port: 43, service: "WHOIS", protocol: "TCP", category: "network", description: "WHOIS Protocol - ドメイン情報クエリ", security: "low", securityNote: "公開情報サービス、一般的に安全" },
    { port: 49, service: "TACACS", protocol: "TCP/UDP", category: "security", description: "Terminal Access Controller Access Control System", security: "medium", securityNote: "認証サービス、適切な設定を確保" },
    { port: 53, service: "DNS", protocol: "TCP/UDP", category: "network", description: "Domain Name System - 名前解決", security: "medium", securityNote: "重要なサービス、DNS攻撃に対して保護" },
    { port: 67, service: "DHCP Server", protocol: "UDP", category: "network", description: "Dynamic Host Configuration Protocol - サーバー", security: "medium", securityNote: "不正なDHCPサーバーに対して保護" },
    { port: 68, service: "DHCP Client", protocol: "UDP", category: "network", description: "Dynamic Host Configuration Protocol - クライアント", security: "medium", securityNote: "クライアント側DHCP通信" },
    { port: 69, service: "TFTP", protocol: "UDP", category: "file", description: "Trivial File Transfer Protocol - 簡易ファイル転送", security: "high", securityNote: "認証機能なし、注意して使用" },
    { port: 70, service: "Gopher", protocol: "TCP", category: "web", description: "Gopher Protocol - 文書取得プロトコル", security: "medium", securityNote: "レガシープロトコル、まれに使用" },
    { port: 79, service: "Finger", protocol: "TCP", category: "system", description: "Finger Protocol - ユーザー情報", security: "high", securityNote: "ユーザー情報を開示、無効化すべき" },
    { port: 80, service: "HTTP", protocol: "TCP", category: "web", description: "Hypertext Transfer Protocol - ウェブトラフィック", security: "low", securityNote: "暗号化されていないウェブトラフィック、機密データにはHTTPS使用" },
    { port: 88, service: "Kerberos", protocol: "TCP/UDP", category: "security", description: "Kerberos認証プロトコル", security: "low", securityNote: "適切に実装されていれば安全" },
    { port: 95, service: "SUPDUP", protocol: "TCP", category: "system", description: "SUPDUP Protocol", security: "high", securityNote: "レガシー端末プロトコル、セキュリティ上の懸念" },

    // 拡張サービス (100-199)
    { port: 101, service: "Hostname", protocol: "TCP", category: "network", description: "NIC Host Name Server", security: "medium", securityNote: "レガシーホスト名サービス" },
    { port: 102, service: "ISO-TSAP", protocol: "TCP", category: "network", description: "ISO Transport Service Access Point", security: "medium", securityNote: "ISOネットワーキングプロトコル" },
    { port: 105, service: "CSNET-NS", protocol: "TCP", category: "network", description: "Mailbox Name Nameserver", security: "medium", securityNote: "レガシーメール名前サービス" },
    { port: 107, service: "Remote Telnet", protocol: "TCP", category: "system", description: "Remote Telnet Service", security: "high", securityNote: "暗号化されていないリモートアクセス、SSH使用" },
    { port: 109, service: "POP2", protocol: "TCP", category: "email", description: "Post Office Protocol version 2", security: "high", securityNote: "廃止予定、POP3またはIMAPを使用" },
    { port: 110, service: "POP3", protocol: "TCP", category: "email", description: "Post Office Protocol version 3 - メール取得", security: "medium", securityNote: "暗号化されていない、POP3Sを使用してセキュリティ向上" },
    { port: 111, service: "RPC Portmapper", protocol: "TCP/UDP", category: "system", description: "ONC RPC Portmapper", security: "high", securityNote: "サービス列挙攻撃に利用される可能性" },
    { port: 113, service: "Ident", protocol: "TCP", category: "network", description: "Identification Protocol - ユーザー識別", security: "medium", securityNote: "ユーザー情報を開示、無効化を検討" },
    { port: 115, service: "SFTP", protocol: "TCP", category: "file", description: "Simple File Transfer Protocol", security: "medium", securityNote: "SSH SFTPと異なる、より安全性が低い" },
    { port: 117, service: "UUCP Path", protocol: "TCP", category: "system", description: "UUCP Path Service", security: "medium", securityNote: "レガシーUNIX通信" },
    { port: 119, service: "NNTP", protocol: "TCP", category: "other", description: "Network News Transfer Protocol", security: "medium", securityNote: "ニュースサーバープロトコル、アクセス制御" },
    { port: 123, service: "NTP", protocol: "UDP", category: "network", description: "Network Time Protocol - 時刻同期", security: "medium", securityNote: "DDoS増幅攻撃に使用される可能性" },
    { port: 135, service: "RPC Endpoint", protocol: "TCP", category: "system", description: "Microsoft RPC Endpoint Mapper", security: "high", securityNote: "Windows脆弱性攻撃の標的、アクセスを制限" },
    { port: 137, service: "NetBIOS Name", protocol: "UDP", category: "system", description: "NetBIOS Name Service", security: "high", securityNote: "Windowsネットワーキング、システム情報漏洩の可能性" },
    { port: 138, service: "NetBIOS Datagram", protocol: "UDP", category: "system", description: "NetBIOS Datagram Service", security: "high", securityNote: "Windowsネットワーキング、セキュリティリスク" },
    { port: 139, service: "NetBIOS Session", protocol: "TCP", category: "system", description: "NetBIOS Session Service", security: "high", securityNote: "レガシーWindowsファイル共有、SMB使用" },
    { port: 143, service: "IMAP", protocol: "TCP", category: "email", description: "Internet Message Access Protocol - メールアクセス", security: "medium", securityNote: "暗号化されていない、IMAPSを使用してセキュリティ向上" },
    { port: 161, service: "SNMP", protocol: "UDP", category: "network", description: "Simple Network Management Protocol", security: "high", securityNote: "デフォルトコミュニティ文字列を変更、アクセス制限" },
    { port: 162, service: "SNMP Trap", protocol: "UDP", category: "network", description: "SNMP Trap - ネットワークデバイス通知", security: "medium", securityNote: "トラップ内の機密情報を監視" },
    { port: 179, service: "BGP", protocol: "TCP", category: "network", description: "Border Gateway Protocol - インターネットルーティング", security: "high", securityNote: "重要なルーティングプロトコル、安全な設定が必須" },
    { port: 194, service: "IRC", protocol: "TCP", category: "other", description: "Internet Relay Chat", security: "medium", securityNote: "マルウェアのコマンド&コントロールに使用される可能性" },

    // 拡張サービス (200-399)
    { port: 199, service: "SMUX", protocol: "TCP", category: "network", description: "SNMP Multiplexing Protocol", security: "medium", securityNote: "SNMP拡張、SNMPと同様にセキュア化" },
    { port: 201, service: "AppleTalk Routing", protocol: "TCP", category: "network", description: "AppleTalk Routing Maintenance", security: "medium", securityNote: "レガシーAppleネットワーキングプロトコル" },
    { port: 202, service: "AppleTalk Name", protocol: "TCP", category: "network", description: "AppleTalk Name Binding", security: "medium", securityNote: "レガシーAppleネットワーキングプロトコル" },
    { port: 204, service: "AppleTalk Echo", protocol: "TCP", category: "network", description: "AppleTalk Echo", security: "low", securityNote: "Appleネットワーキングテストプロトコル" },
    { port: 206, service: "AppleTalk Zone", protocol: "TCP", category: "network", description: "AppleTalk Zone Information", security: "medium", securityNote: "レガシーAppleネットワーキングプロトコル" },
    { port: 209, service: "QMTP", protocol: "TCP", category: "email", description: "Quick Mail Transfer Protocol", security: "medium", securityNote: "SMTPの代替" },
    { port: 210, service: "ANSI Z39.50", protocol: "TCP", category: "database", description: "ANSI Z39.50データベースプロトコル", security: "medium", securityNote: "データベース検索プロトコル" },
    { port: 213, service: "IPX", protocol: "UDP", category: "network", description: "Internetwork Packet Exchange", security: "medium", securityNote: "レガシーNovellネットワーキング" },
    { port: 220, service: "IMAP3", protocol: "TCP", category: "email", description: "Interactive Mail Access Protocol v3", security: "medium", securityNote: "IMAP4を使用してください" },
    { port: 245, service: "LINK", protocol: "TCP", category: "network", description: "LINKプロトコル", security: "medium", securityNote: "ネットワーキングプロトコル" },
    { port: 347, service: "Fatserv", protocol: "TCP", category: "other", description: "Fatmen Server", security: "medium", securityNote: "ファイルシステムプロトコル" },
    { port: 363, service: "RSVP Tunnel", protocol: "TCP", category: "network", description: "RSVP Tunnel", security: "medium", securityNote: "リソース予約プロトコル" },
    { port: 389, service: "LDAP", protocol: "TCP", category: "security", description: "Lightweight Directory Access Protocol", security: "medium", securityNote: "暗号化されていない、LDAPSを使用してセキュリティ向上" },
    { port: 396, service: "Novell Netware", protocol: "TCP", category: "network", description: "Novell Netware over IP", security: "medium", securityNote: "レガシーNovellネットワーキング" },

    // システムおよびネットワークサービス (400-599)
    { port: 443, service: "HTTPS", protocol: "TCP", category: "web", description: "HTTP over SSL/TLS - 安全なウェブトラフィック", security: "low", securityNote: "暗号化されたウェブトラフィック、一般的に安全" },
    { port: 444, service: "SNPP", protocol: "TCP", category: "other", description: "Simple Network Paging Protocol", security: "medium", securityNote: "ページングサービスプロトコル" },
    { port: 445, service: "SMB", protocol: "TCP", category: "system", description: "Server Message Block - Windowsファイル共有", security: "medium", securityNote: "適切な認証と更新で安全" },
    { port: 464, service: "Kerberos Change", protocol: "TCP/UDP", category: "security", description: "Kerberos Change/Set password", security: "low", securityNote: "安全なパスワード変更プロトコル" },
    { port: 465, service: "SMTPS", protocol: "TCP", category: "email", description: "SMTP over SSL - 安全なメール送信", security: "low", securityNote: "暗号化されたメール送信" },
    { port: 500, service: "ISAKMP", protocol: "UDP", category: "security", description: "Internet Security Association and Key Management", security: "low", securityNote: "IPSecキー管理、適切に設定されていれば安全" },
    { port: 512, service: "Rexec", protocol: "TCP", category: "system", description: "Remote Execution - リモートコマンド実行", security: "high", securityNote: "暗号化されておらず、極めて危険、SSH使用" },
    { port: 513, service: "Rlogin", protocol: "TCP", category: "system", description: "Remote Login - リモート端末アクセス", security: "high", securityNote: "暗号化されておらず、SSHを使用" },
    { port: 514, service: "Rsh", protocol: "TCP", category: "system", description: "Remote Shell - リモートコマンドシェル", security: "high", securityNote: "暗号化されておらず、SSHを使用" },
    { port: 515, service: "LPD", protocol: "TCP", category: "system", description: "Line Printer Daemon - 印刷サービス", security: "medium", securityNote: "悪用を防ぐためアクセス制御" },
    { port: 520, service: "RIP", protocol: "UDP", category: "network", description: "Routing Information Protocol", security: "medium", securityNote: "レガシールーティングプロトコル、使用時は認証" },
    { port: 521, service: "RIPng", protocol: "UDP", category: "network", description: "Routing Information Protocol for IPv6", security: "medium", securityNote: "IPv6ルーティングプロトコル" },
    { port: 540, service: "UUCP", protocol: "TCP", category: "system", description: "Unix-to-Unix Copy Protocol", security: "medium", securityNote: "レガシーUNIX通信" },
    { port: 543, service: "Klogin", protocol: "TCP", category: "security", description: "Kerberos Login", security: "medium", securityNote: "Kerberosベースのログインサービス" },
    { port: 544, service: "Kshell", protocol: "TCP", category: "security", description: "Kerberos Shell", security: "medium", securityNote: "Kerberosベースのシェルサービス" },
    { port: 546, service: "DHCPv6 Client", protocol: "UDP", category: "network", description: "DHCPv6 Client", security: "medium", securityNote: "IPv6アドレス設定" },
    { port: 547, service: "DHCPv6 Server", protocol: "UDP", category: "network", description: "DHCPv6 Server", security: "medium", securityNote: "IPv6アドレス配布" },
    { port: 548, service: "AFP", protocol: "TCP", category: "file", description: "Apple Filing Protocol", security: "medium", securityNote: "Appleファイル共有、認証で安全化" },
    { port: 554, service: "RTSP", protocol: "TCP", category: "other", description: "Real Time Streaming Protocol", security: "medium", securityNote: "メディアストリーミングプロトコル" },
    { port: 556, service: "Remotefs", protocol: "TCP", category: "file", description: "Remote File System", security: "high", securityNote: "リモートファイルアクセス、安全な設定が必要" },
    { port: 563, service: "NNTPS", protocol: "TCP", category: "other", description: "NNTP over SSL - 安全なニュース", security: "low", securityNote: "暗号化されたニュースプロトコル" },
    { port: 587, service: "SMTP Submission", protocol: "TCP", category: "email", description: "Email Message Submission", security: "low", securityNote: "認証による安全なメール送信" },

    // 拡張サービス (600-999)
    { port: 636, service: "LDAPS", protocol: "TCP", category: "security", description: "LDAP over SSL - 安全なディレクトリアクセス", security: "low", securityNote: "暗号化されたディレクトリサービス" },
    { port: 666, service: "Doom", protocol: "TCP/UDP", category: "other", description: "Doomゲームプロトコル", security: "low", securityNote: "ゲームプロトコル、一般的に無害" },
    { port: 749, service: "Kerberos Admin", protocol: "TCP/UDP", category: "security", description: "Kerberos Administration", security: "high", securityNote: "管理アクセス、慎重に制限" },
    { port: 750, service: "Kerberos IV", protocol: "UDP", category: "security", description: "Kerberos version IV", security: "medium", securityNote: "レガシーKerberosバージョン" },
    { port: 751, service: "Kerberos Auth", protocol: "TCP", category: "security", description: "Kerberos Authentication", security: "low", securityNote: "安全な認証プロトコル" },
    { port: 752, service: "Kerberos Passwd", protocol: "UDP", category: "security", description: "Kerberos Password Change", security: "low", securityNote: "安全なパスワード変更" },
    { port: 760, service: "Kerberos AS", protocol: "UDP", category: "security", description: "Kerberos Authentication Server", security: "low", securityNote: "Kerberos認証サービス" },
    { port: 777, service: "Multiling HTTP", protocol: "TCP", category: "web", description: "Multiling HTTP", security: "medium", securityNote: "ウェブサービスの変形" },
    { port: 783, service: "SPAMASSASSIN", protocol: "TCP", category: "email", description: "SpamAssassin Daemon", security: "medium", securityNote: "アンチスパムサービス" },
    { port: 873, service: "RSYNC", protocol: "TCP", category: "file", description: "Remote Synchronization", security: "medium", securityNote: "ファイル同期、SSHトンネルで安全化" },
    { port: 888, service: "AccessBuilder", protocol: "TCP", category: "network", description: "AccessBuilder", security: "medium", securityNote: "ネットワークアクセスサービス" },
    { port: 901, service: "SWAT", protocol: "TCP", category: "system", description: "Samba Web Administration Tool", security: "high", securityNote: "ウェブベースのSamba管理" },
    { port: 902, service: "VMware Auth", protocol: "TCP", category: "system", description: "VMware Authentication Daemon", security: "medium", securityNote: "VMwareインフラストラクチャサービス" },
    { port: 903, service: "VMware Console", protocol: "TCP", category: "system", description: "VMware Remote Console", security: "medium", securityNote: "VMware管理インターフェース" },
    { port: 904, service: "VMware Server", protocol: "TCP", category: "system", description: "VMware Server Console", security: "medium", securityNote: "VMwareサーバー管理" },
    { port: 911, service: "NCA", protocol: "TCP", category: "network", description: "Network Cache Access", security: "medium", securityNote: "キャッシュサービスプロトコル" },
    { port: 912, service: "APEX Mesh", protocol: "TCP", category: "network", description: "APEX Mesh", security: "medium", securityNote: "メッシュネットワーキングプロトコル" },
    { port: 981, service: "SofaWare", protocol: "TCP", category: "other", description: "SofaWare Technologies Remote HTTPS", security: "medium", securityNote: "リモートアクセスサービス" },
    { port: 989, service: "FTPS Data", protocol: "TCP", category: "file", description: "FTP over SSL - データ転送", security: "low", securityNote: "暗号化されたファイル転送" },
    { port: 990, service: "FTPS Control", protocol: "TCP", category: "file", description: "FTP over SSL - 制御接続", security: "low", securityNote: "暗号化されたファイル転送制御" },
    { port: 991, service: "NAS", protocol: "TCP", category: "network", description: "Netnews Administration System", security: "medium", securityNote: "ニュース管理サービス" },
    { port: 992, service: "Telnets", protocol: "TCP", category: "system", description: "Telnet over SSL", security: "medium", securityNote: "暗号化されたtelnet、SSH推奨" },
    { port: 993, service: "IMAPS", protocol: "TCP", category: "email", description: "IMAP over SSL - 安全なメールアクセス", security: "low", securityNote: "暗号化されたメールアクセス" },
    { port: 994, service: "IRCS", protocol: "TCP", category: "other", description: "IRC over SSL", security: "medium", securityNote: "暗号化されたチャットプロトコル" },
    { port: 995, service: "POP3S", protocol: "TCP", category: "email", description: "POP3 over SSL - 安全なメール取得", security: "low", securityNote: "暗号化されたメール取得" },
    { port: 996, service: "VSINET", protocol: "TCP", category: "network", description: "VSINET", security: "medium", securityNote: "ネットワークサービスプロトコル" },
    { port: 997, service: "MAITRD", protocol: "TCP", category: "system", description: "MAITRD", security: "medium", securityNote: "システムサービス" },
    { port: 998, service: "Busboy", protocol: "TCP", category: "other", description: "Busboy", security: "medium", securityNote: "アプリケーションサービス" },
    { port: 999, service: "Garcon", protocol: "TCP", category: "other", description: "Garcon", security: "medium", securityNote: "アプリケーションサービス" },

    // 追加のWell-Knownポート (1000-1023)
    { port: 1000, service: "Cadlock", protocol: "TCP", category: "other", description: "Cadlock", security: "medium", securityNote: "アプリケーションサービス" },
    { port: 1001, service: "Web-Based Dist", protocol: "TCP", category: "web", description: "Web-Based Distributed Authoring and Versioning", security: "medium", securityNote: "ウェブコラボレーションプロトコル" },
    { port: 1002, service: "Web-Based", protocol: "TCP", category: "web", description: "Web-Based Distributed Authoring and Versioning", security: "medium", securityNote: "ウェブコラボレーションプロトコル" },
    { port: 1003, service: "Lilisoft", protocol: "TCP", category: "other", description: "Lilisoft Tango", security: "medium", securityNote: "アプリケーションサービス" },
    { port: 1004, service: "Microsoft Lic", protocol: "TCP", category: "system", description: "Microsoft Windows Licensing", security: "medium", securityNote: "Windowsライセンスサービス" },
    { port: 1005, service: "Microsoft MSG", protocol: "TCP", category: "system", description: "Microsoft Windows Messaging", security: "medium", securityNote: "Windowsメッセージングサービス" },
    { port: 1006, service: "Intermec", protocol: "TCP", category: "other", description: "Intermec", security: "medium", securityNote: "工業デバイス通信" },
    { port: 1007, service: "Intermec", protocol: "TCP", category: "other", description: "Intermec", security: "medium", securityNote: "工業デバイス通信" },
    { port: 1008, service: "UFO Server", protocol: "TCP", category: "other", description: "UFO Server", security: "medium", securityNote: "アプリケーションサーバー" },
    { port: 1009, service: "UFO Server", protocol: "TCP", category: "other", description: "UFO Server", security: "medium", securityNote: "アプリケーションサーバー" },
    { port: 1010, service: "Surf", protocol: "TCP", category: "other", description: "Surf", security: "medium", securityNote: "アプリケーションサービス" },
    { port: 1011, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1012, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1013, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1014, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1015, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1016, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1017, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1018, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1019, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1020, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1021, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1022, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },
    { port: 1023, service: "予約済み", protocol: "TCP", category: "system", description: "予約済み", security: "low", securityNote: "将来の使用のために予約済み" },

    // よく使われるアプリケーションポート（Well Knownポート以外）
    { port: 1194, service: "OpenVPN", protocol: "UDP", category: "security", description: "OpenVPN - VPN接続", security: "low", securityNote: "適切に設定されていれば安全" },
    { port: 1433, service: "MS SQL Server", protocol: "TCP", category: "database", description: "Microsoft SQL Server", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 1521, service: "Oracle DB", protocol: "TCP", category: "database", description: "Oracle Database", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 1723, service: "PPTP", protocol: "TCP", category: "security", description: "Point-to-Point Tunneling Protocol - VPN", security: "high", securityNote: "暗号化が弱く、より安全なVPNプロトコルを推奨" },
    { port: 1812, service: "RADIUS Auth", protocol: "UDP", category: "security", description: "Remote Authentication Dial-In User Service - 認証", security: "medium", securityNote: "共有秘密鍵の管理が重要" },
    { port: 1813, service: "RADIUS Accounting", protocol: "UDP", category: "security", description: "RADIUS Accounting - アカウンティング", security: "medium", securityNote: "共有秘密鍵の管理が重要" },
    { port: 1935, service: "RTMP", protocol: "TCP", category: "other", description: "Real Time Messaging Protocol - ストリーミング", security: "medium", securityNote: "ストリーミング用途、適切な認証が必要" },
    { port: 1984, service: "BigBrother", protocol: "TCP", category: "system", description: "システム監視", security: "medium", securityNote: "監視システムへのアクセス制御が重要" },
    { port: 2049, service: "NFS", protocol: "TCP/UDP", category: "file", description: "Network File System - ネットワークファイル共有", security: "medium", securityNote: "適切な認証とアクセス制御が必要" },
    { port: 2121, service: "FTP Alternate", protocol: "TCP", category: "file", description: "FTP代替ポート", security: "high", securityNote: "暗号化されておらず、SFTPやFTPSの使用を推奨" },
    { port: 3000, service: "Development Server", protocol: "TCP", category: "web", description: "開発用Webサーバー（Node.js、React等）", security: "high", securityNote: "開発環境でのみ使用、本番環境では閉じること" },
    { port: 3306, service: "MySQL", protocol: "TCP", category: "database", description: "MySQL Database Server", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 3307, service: "MySQL Alternate", protocol: "TCP", category: "database", description: "MySQL代替ポート", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 3389, service: "RDP", protocol: "TCP", category: "system", description: "Remote Desktop Protocol - リモートデスクトップ", security: "medium", securityNote: "強固な認証とネットワーク制限が必要" },
    { port: 4500, service: "IPSec NAT-T", protocol: "UDP", category: "security", description: "IPSec NAT Traversal", security: "low", securityNote: "適切に設定されていれば安全" },
    { port: 5353, service: "mDNS", protocol: "UDP", category: "network", description: "Multicast DNS - ローカル名前解決", security: "medium", securityNote: "ローカルネットワーク内での情報漏洩リスク" },
    { port: 5432, service: "PostgreSQL", protocol: "TCP", category: "database", description: "PostgreSQL Database Server", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 5433, service: "PostgreSQL Alt", protocol: "TCP", category: "database", description: "PostgreSQL代替ポート", security: "high", securityNote: "外部からのアクセスは制限し、強固な認証を設定" },
    { port: 5672, service: "AMQP", protocol: "TCP", category: "other", description: "Advanced Message Queuing Protocol", security: "medium", securityNote: "メッセージキューイング、適切な認証が必要" },
    { port: 5900, service: "VNC", protocol: "TCP", category: "system", description: "Virtual Network Computing - リモートデスクトップ", security: "high", securityNote: "暗号化が弱く、より安全な代替手段を推奨" },
    { port: 6379, service: "Redis", protocol: "TCP", category: "database", description: "Redis Key-Value Store", security: "high", securityNote: "デフォルトで認証なし、必ず認証を設定" },
    { port: 6667, service: "IRC", protocol: "TCP", category: "other", description: "Internet Relay Chat - 標準ポート", security: "medium", securityNote: "チャット用途、適切な管理が必要" },
    { port: 8000, service: "HTTP Alternate", protocol: "TCP", category: "web", description: "HTTP代替ポート - 開発・テスト環境", security: "medium", securityNote: "本番環境では適切なアクセス制御が必要" },
    { port: 8080, service: "HTTP Alternate", protocol: "TCP", category: "web", description: "HTTPの代替ポート - 開発環境やプロキシサーバーで使用", security: "medium", securityNote: "管理画面等にアクセス可能な場合があるため注意" },
    { port: 8443, service: "HTTPS Alternate", protocol: "TCP", category: "web", description: "HTTPSの代替ポート", security: "medium", securityNote: "管理画面等にアクセス可能な場合があるため注意" },
    { port: 8888, service: "HTTP Alternate", protocol: "TCP", category: "web", description: "HTTP代替ポート - 管理画面等", security: "medium", securityNote: "管理機能へのアクセスに注意" },
    { port: 9000, service: "Application Server", protocol: "TCP", category: "web", description: "アプリケーションサーバー", security: "medium", securityNote: "適切な認証と暗号化が必要" },
    { port: 9090, service: "HTTP Alternate", protocol: "TCP", category: "web", description: "HTTP代替ポート - 管理・監視", security: "medium", securityNote: "管理機能へのアクセス制御が重要" },
    { port: 9200, service: "Elasticsearch", protocol: "TCP", category: "database", description: "Elasticsearch - 検索エンジン", security: "medium", securityNote: "適切な認証とアクセス制御が必要" },
    { port: 11211, service: "Memcached", protocol: "TCP/UDP", category: "database", description: "Memcached - メモリキャッシュ", security: "high", securityNote: "デフォルトで認証なし、外部アクセスを制限" },
    { port: 27015, service: "Steam", protocol: "TCP/UDP", category: "other", description: "Steam ゲームサーバー", security: "low", securityNote: "ゲーム用途、適切な設定で安全" },
    { port: 27017, service: "MongoDB", protocol: "TCP", category: "database", description: "MongoDB Database Server", security: "high", securityNote: "外部からのアクセスは制限し、認証を有効化" }
];

// DOM elements
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const portsContainer = document.getElementById('portsContainer');

// 統計情報の更新
function updatePortStats() {
    const totalPorts = portsData.length;
    const categories = {};
    const protocols = {};
    const securityLevels = {};
    
    portsData.forEach(port => {
        categories[port.category] = (categories[port.category] || 0) + 1;
        protocols[port.protocol] = (protocols[port.protocol] || 0) + 1;
        securityLevels[port.security] = (securityLevels[port.security] || 0) + 1;
    });
    
    console.log(`ポートデータベース統計:`);
    console.log(`総ポート数: ${totalPorts}`);
    console.log('カテゴリ別:', categories);
    console.log('プロトコル別:', protocols);
    console.log('セキュリティレベル別:', securityLevels);
}

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