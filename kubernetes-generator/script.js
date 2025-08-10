// Kubernetes Resource Generator Script
// Following security best practices from repository guidelines

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.resource);
        });
    });

    // Generate button
    document.getElementById('generate-btn').addEventListener('click', generateYAML);
    
    // Copy button
    document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
    
    // Download button
    document.getElementById('download-btn').addEventListener('click', downloadYAML);
}

function switchTab(resourceType) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-resource="${resourceType}"]`).classList.add('active');
    
    // Update forms
    document.querySelectorAll('.resource-form').forEach(form => {
        form.classList.add('hidden');
    });
    document.getElementById(`${resourceType}-form`).classList.remove('hidden');
    
    // Clear output
    clearOutput();
}

function generateYAML() {
    const activeTab = document.querySelector('.tab-button.active').dataset.resource;
    const statusBar = document.getElementById('statusBar');
    
    try {
        let yaml = '';
        
        switch(activeTab) {
            case 'deployment':
                yaml = generateDeploymentYAML();
                break;
            case 'service':
                yaml = generateServiceYAML();
                break;
            case 'configmap':
                yaml = generateConfigMapYAML();
                break;
            default:
                throw new Error('Unknown resource type');
        }
        
        displayYAML(yaml);
        showActionButtons();
        showStatus(statusBar, 'YAMLが生成されました', 'success');
        
    } catch (error) {
        console.error('Generation error:', error);
        showStatus(statusBar, '入力データに問題があります: ' + error.message, 'error');
    }
}

function generateDeploymentYAML() {
    const name = sanitizeInput(document.getElementById('deployment-name').value);
    const namespace = sanitizeInput(document.getElementById('deployment-namespace').value);
    const image = sanitizeInput(document.getElementById('deployment-image').value);
    const replicas = parseInt(document.getElementById('deployment-replicas').value);
    const port = parseInt(document.getElementById('deployment-port').value);
    const labelsInput = sanitizeInput(document.getElementById('deployment-labels').value);
    
    if (!name || !namespace || !image) {
        throw new Error('必須項目が入力されていません');
    }
    
    if (replicas < 1 || port < 1 || port > 65535) {
        throw new Error('無効な数値が入力されています');
    }
    
    const labels = parseLabels(labelsInput);
    const defaultLabels = { app: name };
    const finalLabels = { ...defaultLabels, ...labels };
    
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${namespace}
  labels:
${formatLabels(finalLabels, '    ')}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
${formatLabels(finalLabels, '      ')}
  template:
    metadata:
      labels:
${formatLabels(finalLabels, '        ')}
    spec:
      containers:
      - name: ${name}
        image: ${image}
        ports:
        - containerPort: ${port}
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"`;
}

function generateServiceYAML() {
    const name = sanitizeInput(document.getElementById('service-name').value);
    const namespace = sanitizeInput(document.getElementById('service-namespace').value);
    const type = sanitizeInput(document.getElementById('service-type').value);
    const port = parseInt(document.getElementById('service-port').value);
    const targetPort = parseInt(document.getElementById('service-target-port').value);
    const selectorInput = sanitizeInput(document.getElementById('service-selector').value);
    
    if (!name || !namespace || !type || !selectorInput) {
        throw new Error('必須項目が入力されていません');
    }
    
    if (port < 1 || port > 65535 || targetPort < 1 || targetPort > 65535) {
        throw new Error('無効なポート番号が入力されています');
    }
    
    const selector = parseLabels(selectorInput);
    
    return `apiVersion: v1
kind: Service
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  type: ${type}
  ports:
  - port: ${port}
    targetPort: ${targetPort}
    protocol: TCP
  selector:
${formatLabels(selector, '    ')}`;
}

function generateConfigMapYAML() {
    const name = sanitizeInput(document.getElementById('configmap-name').value);
    const namespace = sanitizeInput(document.getElementById('configmap-namespace').value);
    const dataInput = document.getElementById('configmap-data').value;
    
    if (!name || !namespace) {
        throw new Error('必須項目が入力されていません');
    }
    
    const data = parseConfigMapData(dataInput);
    
    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${name}
  namespace: ${namespace}
data:
${formatConfigMapData(data)}`;
}

function parseLabels(labelsString) {
    const labels = {};
    if (!labelsString.trim()) return labels;
    
    const pairs = labelsString.split(',');
    pairs.forEach(pair => {
        const [key, value] = pair.split('=').map(s => s.trim());
        if (key && value) {
            labels[key] = value;
        }
    });
    
    return labels;
}

function parseConfigMapData(dataString) {
    const data = {};
    if (!dataString.trim()) return data;
    
    const lines = dataString.split('\n');
    lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('='); // Handle values with = in them
            data[key.trim()] = value.trim();
        }
    });
    
    return data;
}

function formatLabels(labels, indent) {
    return Object.entries(labels)
        .map(([key, value]) => `${indent}${key}: ${value}`)
        .join('\n');
}

function formatConfigMapData(data) {
    return Object.entries(data)
        .map(([key, value]) => `  ${key}: "${value}"`)
        .join('\n');
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters
    return input.replace(/[<>\"'&]/g, '').trim();
}

function displayYAML(yaml) {
    const outputElement = document.getElementById('yaml-preview');
    const outputContainer = document.querySelector('.yaml-output');
    
    outputElement.textContent = yaml;
    outputContainer.classList.add('has-content');
    outputContainer.classList.remove('error');
}

function showError(message) {
    const outputElement = document.getElementById('yaml-preview');
    const outputContainer = document.querySelector('.yaml-output');
    
    outputElement.textContent = message;
    outputContainer.classList.add('error');
    outputContainer.classList.remove('has-content');
    
    hideActionButtons();
}

function clearOutput() {
    const outputElement = document.getElementById('yaml-preview');
    const outputContainer = document.querySelector('.yaml-output');
    
    outputElement.textContent = 'Click "Generate YAML" to create your Kubernetes resource manifest.';
    outputContainer.classList.remove('has-content', 'error');
    
    hideActionButtons();
}

function showActionButtons() {
    document.getElementById('copy-btn').classList.remove('hidden');
    document.getElementById('download-btn').classList.remove('hidden');
}

function hideActionButtons() {
    document.getElementById('copy-btn').classList.add('hidden');
    document.getElementById('download-btn').classList.add('hidden');
}

function copyToClipboard() {
    const yamlContent = document.getElementById('yaml-preview').textContent;
    const statusBar = document.getElementById('statusBar');
    copyToClipboard(yamlContent, (message, type) => showStatus(statusBar, message, type));
}

function downloadYAML() {
    const yamlContent = document.getElementById('yaml-preview').textContent;
    const activeTab = document.querySelector('.tab-button.active').dataset.resource;
    const resourceName = document.getElementById(`${activeTab}-name`).value || 'resource';
    const statusBar = document.getElementById('statusBar');
    
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${resourceName}-${activeTab}.yaml`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showStatus(statusBar, 'YAMLファイルをダウンロードしました', 'success');
}