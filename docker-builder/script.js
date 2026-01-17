class DockerBuilder {
    constructor() {
        console.log('DockerBuilder: Constructor called');
        try {
            this.initializeElements();
            this.initializeEventListeners();
            this.templates = this.initializeTemplates();
            this.generateCommand();
            console.log('DockerBuilder: Constructor completed successfully');
        } catch (error) {
            console.error('DockerBuilder: Error in constructor:', error);
        }
    }
    
    initializeElements() {
        console.log('DockerBuilder: initializing elements');
        
        // Input elements
        this.imageName = document.getElementById('imageName');
        this.containerName = document.getElementById('containerName');
        this.runMode = document.getElementById('runMode');
        this.portMappings = document.getElementById('portMappings');
        this.volumeMounts = document.getElementById('volumeMounts');
        this.envVars = document.getElementById('envVars');
        this.networkMode = document.getElementById('networkMode');
        this.customNetwork = document.getElementById('customNetwork');
        this.restartPolicy = document.getElementById('restartPolicy');
        this.workingDir = document.getElementById('workingDir');
        this.command = document.getElementById('command');
        this.memoryLimit = document.getElementById('memoryLimit');
        this.cpuLimit = document.getElementById('cpuLimit');
        this.healthCheck = document.getElementById('healthCheck');
        this.healthInterval = document.getElementById('healthInterval');
        
        // Output elements
        this.statusBar = document.getElementById('statusBar');
        this.dockerCommand = document.getElementById('dockerCommand');
        this.dockerCompose = document.getElementById('dockerCompose');
        this.commandBreakdown = document.getElementById('commandBreakdown');
        
        // Buttons
        this.copyCommand = document.getElementById('copyCommand');
        this.copyCompose = document.getElementById('copyCompose');
        this.generateCommandBtn = document.getElementById('generateCommand');
        this.generateComposeBtn = document.getElementById('generateCompose');
        
        // Debug: Check if critical elements are found
        if (!this.generateCommandBtn) {
            console.error('DockerBuilder: generateCommand button not found in DOM!');
        } else {
            console.log('DockerBuilder: generateCommand button found:', this.generateCommandBtn);
        }
        
        if (!this.dockerCommand) {
            console.error('DockerBuilder: dockerCommand textarea not found in DOM!');
        } else {
            console.log('DockerBuilder: dockerCommand textarea found:', this.dockerCommand);
        }
        
        // Template buttons
        this.nginxTemplate = document.getElementById('nginxTemplate');
        this.mysqlTemplate = document.getElementById('mysqlTemplate');
        this.nodeTemplate = document.getElementById('nodeTemplate');
        this.redisTemplate = document.getElementById('redisTemplate');
        this.ubuntuTemplate = document.getElementById('ubuntuTemplate');
        this.postgresTemplate = document.getElementById('postgresTemplate');
        this.mongoTemplate = document.getElementById('mongoTemplate');
        this.elasticsearchTemplate = document.getElementById('elasticsearchTemplate');
        this.apacheTemplate = document.getElementById('apacheTemplate');
    }
    
    initializeEventListeners() {
        console.log('DockerBuilder: initializing event listeners');
        
        // Input change listeners
        const inputs = [
            this.imageName, this.containerName, this.runMode, this.portMappings,
            this.volumeMounts, this.envVars, this.networkMode, this.customNetwork,
            this.restartPolicy, this.workingDir, this.command, this.memoryLimit,
            this.cpuLimit, this.healthCheck, this.healthInterval
        ];
        
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.generateCommand());
                input.addEventListener('change', () => this.generateCommand());
            } else {
                console.error('DockerBuilder: Missing input element');
            }
        });
        
        // Button listeners
        if (this.copyCommand) {
            this.copyCommand.addEventListener('click', () => copyToClipboard(this.dockerCommand.value, (message, type) => this.showStatus(message, type)));
        } else {
            console.error('DockerBuilder: copyCommand button not found');
        }
        
        if (this.copyCompose) {
            this.copyCompose.addEventListener('click', () => copyToClipboard(this.dockerCompose.value, (message, type) => this.showStatus(message, type)));
        } else {
            console.error('DockerBuilder: copyCompose button not found');
        }
        
        if (this.generateCommandBtn) {
            console.log('DockerBuilder: generateCommandBtn found, adding click listener');
            // Try multiple event binding approaches
            this.generateCommandBtn.addEventListener('click', (event) => {
                console.log('DockerBuilder: generateCommand button clicked via addEventListener');
                event.preventDefault();
                event.stopPropagation();
                try {
                    this.generateCommand();
                } catch (error) {
                    console.error('DockerBuilder: Error in generateCommand:', error);
                }
            });
            
            // Also try onclick as backup
            this.generateCommandBtn.onclick = (event) => {
                console.log('DockerBuilder: generateCommand button clicked via onclick');
                event.preventDefault();
                event.stopPropagation();
                try {
                    this.generateCommand();
                } catch (error) {
                    console.error('DockerBuilder: Error in generateCommand via onclick:', error);
                }
            };
        } else {
            console.error('DockerBuilder: generateCommandBtn not found');
        }
        
        if (this.generateComposeBtn) {
            this.generateComposeBtn.addEventListener('click', () => this.generateDockerCompose());
        } else {
            console.error('DockerBuilder: generateComposeBtn not found');
        }
        
        // Alternative direct DOM binding as fallback
        setTimeout(() => {
            const directGenBtn = document.getElementById('generateCommand');
            if (directGenBtn && directGenBtn !== this.generateCommandBtn) {
                console.log('DockerBuilder: Found generateCommand via direct DOM query, adding backup listener');
                directGenBtn.addEventListener('click', (event) => {
                    console.log('DockerBuilder: generateCommand clicked via direct DOM backup');
                    event.preventDefault();
                    event.stopPropagation();
                    try {
                        this.generateCommand();
                    } catch (error) {
                        console.error('DockerBuilder: Error in direct DOM backup:', error);
                    }
                });
            }
        }, 100);
        
        // Template listeners
        this.nginxTemplate.addEventListener('click', () => this.loadTemplate('nginx'));
        this.mysqlTemplate.addEventListener('click', () => this.loadTemplate('mysql'));
        this.nodeTemplate.addEventListener('click', () => this.loadTemplate('node'));
        this.redisTemplate.addEventListener('click', () => this.loadTemplate('redis'));
        this.ubuntuTemplate.addEventListener('click', () => this.loadTemplate('ubuntu'));
        this.postgresTemplate.addEventListener('click', () => this.loadTemplate('postgres'));
        this.mongoTemplate.addEventListener('click', () => this.loadTemplate('mongo'));
        this.elasticsearchTemplate.addEventListener('click', () => this.loadTemplate('elasticsearch'));
        this.apacheTemplate.addEventListener('click', () => this.loadTemplate('apache'));
    }
    
    initializeTemplates() {
        return {
            nginx: {
                imageName: 'nginx:latest',
                containerName: 'nginx-server',
                runMode: 'detached',
                portMappings: '80:80\n443:443',
                volumeMounts: '/host/nginx.conf:/etc/nginx/nginx.conf:ro\n/host/html:/usr/share/nginx/html:ro',
                envVars: '',
                networkMode: '',
                customNetwork: '',
                restartPolicy: 'unless-stopped',
                workingDir: '',
                command: '',
                memoryLimit: '256m',
                cpuLimit: '0.3',
                healthCheck: 'curl -f http://localhost:80',
                healthInterval: '30s'
            },
            mysql: {
                imageName: 'mysql:8.0',
                containerName: 'mysql-db',
                runMode: 'detached',
                portMappings: '3306:3306',
                volumeMounts: 'mysql-data:/var/lib/mysql',
                envVars: 'MYSQL_ROOT_PASSWORD=yourpassword\nMYSQL_DATABASE=myapp\nMYSQL_USER=myuser\nMYSQL_PASSWORD=mypassword',
                networkMode: '',
                customNetwork: '',
                restartPolicy: 'unless-stopped',
                workingDir: '',
                command: '',
                memoryLimit: '1g',
                cpuLimit: '0.5',
                healthCheck: 'mysqladmin ping -h localhost',
                healthInterval: '30s'
            },
            node: {
                imageName: 'node:18-alpine',
                containerName: 'node-app',
                runMode: 'detached',
                portMappings: '3000:3000',
                volumeMounts: '/host/app:/app\n/app/node_modules',
                envVars: 'NODE_ENV=production\nPORT=3000',
                networkMode: '',
                customNetwork: '',
                restartPolicy: 'unless-stopped',
                workingDir: '/app',
                command: 'npm start',
                memoryLimit: '512m',
                cpuLimit: '0.5',
                healthCheck: 'curl -f http://localhost:3000/health',
                healthInterval: '30s'
            },
            redis: {
                imageName: 'redis:7-alpine',
                containerName: 'redis-cache',
                runMode: 'detached',
                portMappings: '6379:6379',
                volumeMounts: 'redis-data:/data',
                envVars: '',
                networkMode: '',
                customNetwork: '',
                restartPolicy: 'unless-stopped',
                workingDir: '',
                command: '',
                memoryLimit: '256m',
                cpuLimit: '0.3',
                healthCheck: 'redis-cli ping',
                healthInterval: '30s'
            },
            ubuntu: {
                imageName: 'ubuntu:22.04',
                containerName: 'ubuntu-container',
                runMode: 'interactive',
                portMappings: '',
                volumeMounts: '/host/data:/data',
                envVars: '',
                networkMode: '',
                customNetwork: '',
                restartPolicy: '',
                workingDir: '',
                command: '/bin/bash',
                memoryLimit: '',
                cpuLimit: '',
                healthCheck: '',
                healthInterval: ''
            },
            postgres: {
                imageName: 'postgres:15',
                containerName: 'postgres-db',
                runMode: 'detached',
                portMappings: '5432:5432',
                volumeMounts: 'postgres-data:/var/lib/postgresql/data',
                envVars: 'POSTGRES_DB=myapp\nPOSTGRES_USER=myuser\nPOSTGRES_PASSWORD=mypassword',
                networkMode: '',
                customNetwork: '',
                restartPolicy: 'unless-stopped',
                workingDir: '',
                command: '',
                memoryLimit: '512m',
                cpuLimit: '0.5',
                healthCheck: 'pg_isready -U myuser -d myapp',
                healthInterval: '30s'
            },
            mongo: {
                imageName: 'mongo:7.0',
                containerName: 'mongo-db',
                runMode: 'detached',
                portMappings: '27017:27017',
                volumeMounts: 'mongo-data:/data/db',
                envVars: 'MONGO_INITDB_ROOT_USERNAME=root\nMONGO_INITDB_ROOT_PASSWORD=rootpassword\nMONGO_INITDB_DATABASE=myapp',
                networkMode: '',
                customNetwork: '',
                restartPolicy: 'unless-stopped',
                workingDir: '',
                command: '',
                memoryLimit: '1g',
                cpuLimit: '0.7',
                healthCheck: 'mongosh --eval "db.adminCommand(\'ping\')"',
                healthInterval: '30s'
            },
            elasticsearch: {
                imageName: 'elasticsearch:8.11.0',
                containerName: 'elasticsearch',
                runMode: 'detached',
                portMappings: '9200:9200\n9300:9300',
                volumeMounts: 'es-data:/usr/share/elasticsearch/data',
                envVars: 'discovery.type=single-node\nxpack.security.enabled=false\nES_JAVA_OPTS=-Xms512m -Xmx512m',
                networkMode: '',
                customNetwork: '',
                restartPolicy: 'unless-stopped',
                workingDir: '',
                command: '',
                memoryLimit: '1g',
                cpuLimit: '1.0',
                healthCheck: 'curl -f http://localhost:9200/_cluster/health',
                healthInterval: '30s'
            },
            apache: {
                imageName: 'httpd:2.4',
                containerName: 'apache-server',
                runMode: 'detached',
                portMappings: '80:80',
                volumeMounts: '/host/htdocs:/usr/local/apache2/htdocs/:ro\n/host/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro',
                envVars: '',
                networkMode: '',
                customNetwork: '',
                restartPolicy: 'unless-stopped',
                workingDir: '',
                command: '',
                memoryLimit: '256m',
                cpuLimit: '0.3',
                healthCheck: 'curl -f http://localhost:80',
                healthInterval: '30s'
            }
        };
    }
    
    loadTemplate(templateName) {
        const template = this.templates[templateName];
        if (!template) return;
        
        this.imageName.value = template.imageName;
        this.containerName.value = template.containerName;
        this.runMode.value = template.runMode;
        this.portMappings.value = template.portMappings;
        this.volumeMounts.value = template.volumeMounts;
        this.envVars.value = template.envVars;
        this.networkMode.value = template.networkMode;
        this.customNetwork.value = template.customNetwork;
        this.restartPolicy.value = template.restartPolicy;
        this.workingDir.value = template.workingDir;
        this.command.value = template.command;
        this.memoryLimit.value = template.memoryLimit || '';
        this.cpuLimit.value = template.cpuLimit || '';
        this.healthCheck.value = template.healthCheck || '';
        this.healthInterval.value = template.healthInterval || '';
        
        this.generateCommand();
        this.showStatus(`${templateName.toUpperCase()}テンプレートが読み込まれました`, 'success');
    }
    
    generateCommand() {
        console.log('DockerBuilder: generateCommand method called');
        
        try {
            const imageName = this.imageName.value.trim();
            console.log('DockerBuilder: imageName =', imageName);
            
            if (!imageName) {
                console.log('DockerBuilder: No image name provided, clearing output');
                this.dockerCommand.value = '';
                this.commandBreakdown.textContent = '';
                return;
            }
        } catch (error) {
            console.error('DockerBuilder: Error getting imageName:', error);
            return;
        }
        
        let command = 'docker run';
        let breakdown = [];
        
        // Run mode
        if (this.runMode.value === 'detached') {
            command += ' -d';
            breakdown.push({
                flag: '-d',
                value: '',
                description: 'デタッチモード（バックグラウンドで実行）'
            });
        } else if (this.runMode.value === 'interactive') {
            command += ' -it';
            breakdown.push({
                flag: '-it',
                value: '',
                description: 'インタラクティブモード（対話的実行）'
            });
        }
        
        // Container name
        if (this.containerName.value.trim()) {
            command += ` --name ${this.containerName.value.trim()}`;
            breakdown.push({
                flag: '--name',
                value: this.containerName.value.trim(),
                description: 'コンテナ名を指定'
            });
        }
        
        // Port mappings
        if (this.portMappings.value.trim()) {
            const ports = this.portMappings.value.trim().split('\n');
            ports.forEach(port => {
                const mapping = port.trim();
                if (mapping) {
                    command += ` -p ${mapping}`;
                    breakdown.push({
                        flag: '-p',
                        value: mapping,
                        description: 'ポートマッピング（ホスト:コンテナ）'
                    });
                }
            });
        }
        
        // Volume mounts
        if (this.volumeMounts.value.trim()) {
            const volumes = this.volumeMounts.value.trim().split('\n');
            volumes.forEach(volume => {
                const mapping = volume.trim();
                if (mapping) {
                    command += ` -v ${mapping}`;
                    breakdown.push({
                        flag: '-v',
                        value: mapping,
                        description: 'ボリュームマウント'
                    });
                }
            });
        }
        
        // Environment variables
        if (this.envVars.value.trim()) {
            const envs = this.envVars.value.trim().split('\n');
            envs.forEach(env => {
                const variable = env.trim();
                if (variable) {
                    command += ` -e ${variable}`;
                    breakdown.push({
                        flag: '-e',
                        value: variable,
                        description: '環境変数'
                    });
                }
            });
        }
        
        // Network mode
        if (this.networkMode.value) {
            command += ` --network ${this.networkMode.value}`;
            breakdown.push({
                flag: '--network',
                value: this.networkMode.value,
                description: 'ネットワークモード'
            });
        }
        
        // Custom network
        if (this.customNetwork.value.trim()) {
            command += ` --network ${this.customNetwork.value.trim()}`;
            breakdown.push({
                flag: '--network',
                value: this.customNetwork.value.trim(),
                description: 'カスタムネットワーク'
            });
        }
        
        // Restart policy
        if (this.restartPolicy.value) {
            command += ` --restart ${this.restartPolicy.value}`;
            breakdown.push({
                flag: '--restart',
                value: this.restartPolicy.value,
                description: '再起動ポリシー'
            });
        }
        
        // Working directory
        if (this.workingDir.value.trim()) {
            command += ` -w ${this.workingDir.value.trim()}`;
            breakdown.push({
                flag: '-w',
                value: this.workingDir.value.trim(),
                description: '作業ディレクトリ'
            });
        }
        
        // Memory limit
        if (this.memoryLimit.value.trim()) {
            command += ` -m ${this.memoryLimit.value.trim()}`;
            breakdown.push({
                flag: '-m',
                value: this.memoryLimit.value.trim(),
                description: 'メモリ制限'
            });
        }
        
        // CPU limit
        if (this.cpuLimit.value.trim()) {
            command += ` --cpus ${this.cpuLimit.value.trim()}`;
            breakdown.push({
                flag: '--cpus',
                value: this.cpuLimit.value.trim(),
                description: 'CPU制限'
            });
        }
        
        // Health check
        if (this.healthCheck.value.trim()) {
            let healthCmd = `--health-cmd="${this.healthCheck.value.trim()}"`;
            if (this.healthInterval.value.trim()) {
                healthCmd += ` --health-interval=${this.healthInterval.value.trim()}`;
            }
            command += ` ${healthCmd}`;
            breakdown.push({
                flag: '--health-cmd',
                value: this.healthCheck.value.trim(),
                description: 'ヘルスチェックコマンド'
            });
            if (this.healthInterval.value.trim()) {
                breakdown.push({
                    flag: '--health-interval',
                    value: this.healthInterval.value.trim(),
                    description: 'ヘルスチェック間隔'
                });
            }
        }
        
        // Image name
        command += ` ${imageName}`;
        breakdown.push({
            flag: 'IMAGE',
            value: imageName,
            description: 'Dockerイメージ名'
        });
        
        // Command
        if (this.command.value.trim()) {
            command += ` ${this.command.value.trim()}`;
            breakdown.push({
                flag: 'CMD',
                value: this.command.value.trim(),
                description: 'コンテナ内で実行するコマンド'
            });
        }
        
        try {
            this.dockerCommand.value = command;
            console.log('DockerBuilder: Docker command generated:', command);
            this.renderCommandBreakdown(breakdown);
            this.generateDockerCompose();
            console.log('DockerBuilder: generateCommand completed successfully');
        } catch (error) {
            console.error('DockerBuilder: Error setting command output:', error);
        }
    }
    
    renderCommandBreakdown(breakdown) {
        this.commandBreakdown.textContent = '';
        breakdown.forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.className = 'breakdown-item';

            const flagSpan = document.createElement('span');
            flagSpan.className = 'breakdown-flag';
            flagSpan.textContent = item.flag;
            wrapper.appendChild(flagSpan);

            if (item.value) {
                const valueSpan = document.createElement('span');
                valueSpan.className = 'breakdown-value';
                valueSpan.textContent = ` ${item.value}`;
                wrapper.appendChild(valueSpan);
            }

            const descDiv = document.createElement('div');
            descDiv.className = 'breakdown-description';
            descDiv.textContent = item.description;
            wrapper.appendChild(descDiv);

            this.commandBreakdown.appendChild(wrapper);
        });
    }
    
    generateDockerCompose() {
        const imageName = this.imageName.value.trim();
        const containerName = this.containerName.value.trim() || 'app';
        
        if (!imageName) {
            this.dockerCompose.value = '';
            return;
        }
        
        let compose = `version: '3.8'\n\nservices:\n  ${containerName}:\n    image: ${imageName}\n`;
        
        // Container name
        if (this.containerName.value.trim()) {
            compose += `    container_name: ${this.containerName.value.trim()}\n`;
        }
        
        // Port mappings
        if (this.portMappings.value.trim()) {
            compose += `    ports:\n`;
            const ports = this.portMappings.value.trim().split('\n');
            ports.forEach(port => {
                const mapping = port.trim();
                if (mapping) {
                    compose += `      - "${mapping}"\n`;
                }
            });
        }
        
        // Volume mounts
        if (this.volumeMounts.value.trim()) {
            compose += `    volumes:\n`;
            const volumes = this.volumeMounts.value.trim().split('\n');
            volumes.forEach(volume => {
                const mapping = volume.trim();
                if (mapping) {
                    compose += `      - "${mapping}"\n`;
                }
            });
        }
        
        // Environment variables
        if (this.envVars.value.trim()) {
            compose += `    environment:\n`;
            const envs = this.envVars.value.trim().split('\n');
            envs.forEach(env => {
                const variable = env.trim();
                if (variable) {
                    compose += `      - ${variable}\n`;
                }
            });
        }
        
        // Network mode
        if (this.networkMode.value) {
            compose += `    network_mode: "${this.networkMode.value}"\n`;
        }
        
        // Custom network
        if (this.customNetwork.value.trim()) {
            compose += `    networks:\n      - ${this.customNetwork.value.trim()}\n`;
        }
        
        // Restart policy
        if (this.restartPolicy.value) {
            compose += `    restart: ${this.restartPolicy.value}\n`;
        }
        
        // Working directory
        if (this.workingDir.value.trim()) {
            compose += `    working_dir: ${this.workingDir.value.trim()}\n`;
        }
        
        // Command
        if (this.command.value.trim()) {
            compose += `    command: ${this.command.value.trim()}\n`;
        }
        
        // Resource limits
        if (this.memoryLimit.value.trim() || this.cpuLimit.value.trim()) {
            compose += `    deploy:\n      resources:\n        limits:\n`;
            if (this.memoryLimit.value.trim()) {
                compose += `          memory: ${this.memoryLimit.value.trim()}\n`;
            }
            if (this.cpuLimit.value.trim()) {
                compose += `          cpus: '${this.cpuLimit.value.trim()}'\n`;
            }
        }
        
        // Health check
        if (this.healthCheck.value.trim()) {
            compose += `    healthcheck:\n      test: [\"CMD-SHELL\", \"${this.healthCheck.value.trim()}\"]\n`;
            if (this.healthInterval.value.trim()) {
                compose += `      interval: ${this.healthInterval.value.trim()}\n`;
            }
            compose += `      timeout: 10s\n      retries: 3\n`;
        }
        
        // Add networks section if custom network is used
        if (this.customNetwork.value.trim()) {
            compose += `\nnetworks:\n  ${this.customNetwork.value.trim()}:\n    external: true\n`;
        }
        
        this.dockerCompose.value = compose;
    }
    
    showStatus(message, type = 'info') {
        showStatus(this.statusBar, message, type);
        
        // Auto-hide status after 3 seconds
        setTimeout(() => {
            this.statusBar.textContent = '';
            this.statusBar.className = 'status-bar';
        }, 3000);
    }
}

// Initialize the Docker Builder when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DockerBuilder: DOMContentLoaded event fired');
    try {
        const dockerBuilder = new DockerBuilder();
        
        // Additional backup event listener as a last resort
        setTimeout(() => {
            const generateBtn = document.getElementById('generateCommand');
            if (generateBtn) {
                console.log('DockerBuilder: Adding final backup listener');
                generateBtn.addEventListener('click', function() {
                    console.log('DockerBuilder: Final backup listener triggered');
                    if (dockerBuilder && typeof dockerBuilder.generateCommand === 'function') {
                        dockerBuilder.generateCommand();
                    } else {
                        console.error('DockerBuilder: dockerBuilder instance or generateCommand method not available');
                    }
                }, true); // Use capture phase
            }
        }, 500);
        
    } catch (error) {
        console.error('DockerBuilder: Error initializing DockerBuilder:', error);
    }
});