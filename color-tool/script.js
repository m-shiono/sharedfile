class ColorTool {
    constructor() {
        this.colorPicker = document.getElementById('colorPicker');
        this.colorPreview = document.getElementById('colorPreview');
        this.hexInput = document.getElementById('hexInput');
        this.rgbInput = document.getElementById('rgbInput');
        this.hslInput = document.getElementById('hslInput');
        this.hsvInput = document.getElementById('hsvInput');
        this.paletteDisplay = document.getElementById('paletteDisplay');
        this.foregroundColor = document.getElementById('foregroundColor');
        this.backgroundColor = document.getElementById('backgroundColor');
        this.foregroundHex = document.getElementById('foregroundHex');
        this.backgroundHex = document.getElementById('backgroundHex');
        this.contrastPreview = document.getElementById('contrastPreview');
        this.contrastRatio = document.getElementById('contrastRatio');
        this.wcagAA = document.getElementById('wcagAA');
        this.wcagAAA = document.getElementById('wcagAAA');
        this.savedPalettes = document.getElementById('savedPalettes');
        
        this.currentColor = '#4caf50';
        this.currentPalette = [];
        this.savedPalettesData = this.loadSavedPalettes();
        
        this.initializeEventListeners();
        this.updateColorDisplay();
        this.updateContrastChecker();
        this.displaySavedPalettes();
    }
    
    initializeEventListeners() {
        this.colorPicker.addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.updateColorDisplay();
        });
        
        this.hexInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (this.isValidHex(hex)) {
                this.currentColor = hex;
                this.colorPicker.value = hex;
                this.updateColorDisplay();
            }
        });
        
        this.rgbInput.addEventListener('input', (e) => {
            const rgb = this.parseRgb(e.target.value);
            if (rgb) {
                this.currentColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
                this.colorPicker.value = this.currentColor;
                this.updateColorDisplay();
            }
        });
        
        this.hslInput.addEventListener('input', (e) => {
            const hsl = this.parseHsl(e.target.value);
            if (hsl) {
                const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
                this.currentColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
                this.colorPicker.value = this.currentColor;
                this.updateColorDisplay();
            }
        });
        
        this.hsvInput.addEventListener('input', (e) => {
            const hsv = this.parseHsv(e.target.value);
            if (hsv) {
                const rgb = this.hsvToRgb(hsv.h, hsv.s, hsv.v);
                this.currentColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
                this.colorPicker.value = this.currentColor;
                this.updateColorDisplay();
            }
        });
        
        document.getElementById('generateComplementary').addEventListener('click', () => {
            this.generateComplementaryPalette();
        });
        
        document.getElementById('generateTriadic').addEventListener('click', () => {
            this.generateTriadicPalette();
        });
        
        document.getElementById('generateAnalogous').addEventListener('click', () => {
            this.generateAnalogousPalette();
        });
        
        document.getElementById('generateMonochromatic').addEventListener('click', () => {
            this.generateMonochromaticPalette();
        });
        
        document.getElementById('generateRandom').addEventListener('click', () => {
            this.generateRandomPalette();
        });
        
        document.getElementById('copyPalette').addEventListener('click', () => {
            this.copyPalette();
        });
        
        document.getElementById('savePalette').addEventListener('click', () => {
            this.savePalette();
        });
        
        this.foregroundColor.addEventListener('input', (e) => {
            this.foregroundHex.value = e.target.value;
            this.updateContrastChecker();
        });
        
        this.backgroundColor.addEventListener('input', (e) => {
            this.backgroundHex.value = e.target.value;
            this.updateContrastChecker();
        });
        
        this.foregroundHex.addEventListener('input', (e) => {
            if (this.isValidHex(e.target.value)) {
                this.foregroundColor.value = e.target.value;
                this.updateContrastChecker();
            }
        });
        
        this.backgroundHex.addEventListener('input', (e) => {
            if (this.isValidHex(e.target.value)) {
                this.backgroundColor.value = e.target.value;
                this.updateContrastChecker();
            }
        });
    }
    
    updateColorDisplay() {
        this.colorPreview.style.backgroundColor = this.currentColor;
        
        const rgb = this.hexToRgb(this.currentColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
        
        this.hexInput.value = this.currentColor;
        this.rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        this.hslInput.value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
        this.hsvInput.value = `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`;
    }
    
    updateContrastChecker() {
        const fg = this.foregroundColor.value;
        const bg = this.backgroundColor.value;
        
        this.contrastPreview.style.color = fg;
        this.contrastPreview.style.backgroundColor = bg;
        
        const contrast = this.calculateContrast(fg, bg);
        this.contrastRatio.innerHTML = `
            <span>コントラスト比: ${contrast.toFixed(2)}:1</span>
            <div class="wcag-compliance">
                <span class="wcag-aa ${contrast >= 4.5 ? 'pass' : 'fail'}">WCAG AA: ${contrast >= 4.5 ? '✓' : '✗'}</span>
                <span class="wcag-aaa ${contrast >= 7 ? 'pass' : 'fail'}">WCAG AAA: ${contrast >= 7 ? '✓' : '✗'}</span>
            </div>
        `;
    }
    
    generateComplementaryPalette() {
        const rgb = this.hexToRgb(this.currentColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        const complementaryHue = (hsl.h + 180) % 360;
        const complementaryRgb = this.hslToRgb(complementaryHue, hsl.s, hsl.l);
        
        this.currentPalette = [
            this.currentColor,
            this.rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b)
        ];
        
        this.displayPalette();
    }
    
    generateTriadicPalette() {
        const rgb = this.hexToRgb(this.currentColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        const colors = [this.currentColor];
        for (let i = 1; i < 3; i++) {
            const hue = (hsl.h + i * 120) % 360;
            const rgbColor = this.hslToRgb(hue, hsl.s, hsl.l);
            colors.push(this.rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b));
        }
        
        this.currentPalette = colors;
        this.displayPalette();
    }
    
    generateAnalogousPalette() {
        const rgb = this.hexToRgb(this.currentColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        const colors = [];
        for (let i = -2; i <= 2; i++) {
            const hue = (hsl.h + i * 30 + 360) % 360;
            const rgbColor = this.hslToRgb(hue, hsl.s, hsl.l);
            colors.push(this.rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b));
        }
        
        this.currentPalette = colors;
        this.displayPalette();
    }
    
    generateMonochromaticPalette() {
        const rgb = this.hexToRgb(this.currentColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        const colors = [];
        for (let i = 0; i < 5; i++) {
            const lightness = Math.max(10, Math.min(90, hsl.l + (i - 2) * 20));
            const rgbColor = this.hslToRgb(hsl.h, hsl.s, lightness);
            colors.push(this.rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b));
        }
        
        this.currentPalette = colors;
        this.displayPalette();
    }
    
    generateRandomPalette() {
        const colors = [];
        for (let i = 0; i < 5; i++) {
            const hue = Math.floor(Math.random() * 360);
            const saturation = Math.floor(Math.random() * 50) + 50;
            const lightness = Math.floor(Math.random() * 40) + 30;
            const rgb = this.hslToRgb(hue, saturation, lightness);
            colors.push(this.rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        
        this.currentPalette = colors;
        this.displayPalette();
    }
    
    displayPalette() {
        this.paletteDisplay.innerHTML = '';
        
        this.currentPalette.forEach((color, index) => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'palette-color';
            colorDiv.style.backgroundColor = color;
            colorDiv.title = color;
            
            const codeSpan = document.createElement('span');
            codeSpan.className = 'palette-color-code';
            codeSpan.textContent = color;
            
            colorDiv.appendChild(codeSpan);
            
            colorDiv.addEventListener('click', () => {
                this.currentColor = color;
                this.colorPicker.value = color;
                this.updateColorDisplay();
            });
            
            this.paletteDisplay.appendChild(colorDiv);
        });
    }
    
    async copyPalette() {
        if (this.currentPalette.length === 0) {
            alert('パレットが生成されていません');
            return;
        }
        
        const paletteText = this.currentPalette.join('\n');
        
        try {
            await navigator.clipboard.writeText(paletteText);
            alert('パレットをクリップボードにコピーしました');
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = paletteText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('パレットをクリップボードにコピーしました');
        }
    }
    
    savePalette() {
        if (this.currentPalette.length === 0) {
            alert('パレットが生成されていません');
            return;
        }
        
        const name = prompt('パレット名を入力してください:', `パレット ${this.savedPalettesData.length + 1}`);
        if (!name) return;
        
        const palette = {
            id: Date.now(),
            name: name,
            colors: [...this.currentPalette],
            created: new Date().toISOString()
        };
        
        this.savedPalettesData.push(palette);
        this.savePalettesToStorage();
        this.displaySavedPalettes();
        alert('パレットを保存しました');
    }
    
    displaySavedPalettes() {
        this.savedPalettes.innerHTML = '';
        
        this.savedPalettesData.forEach(palette => {
            const paletteDiv = document.createElement('div');
            paletteDiv.className = 'saved-palette';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'saved-palette-name';
            nameDiv.textContent = palette.name;
            
            const colorsDiv = document.createElement('div');
            colorsDiv.className = 'saved-palette-colors';
            
            palette.colors.forEach(color => {
                const colorDiv = document.createElement('div');
                colorDiv.className = 'saved-palette-color';
                colorDiv.style.backgroundColor = color;
                colorDiv.title = color;
                colorsDiv.appendChild(colorDiv);
            });
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'saved-palette-actions';
            
            const loadBtn = document.createElement('button');
            loadBtn.textContent = '読み込み';
            loadBtn.addEventListener('click', () => {
                this.currentPalette = [...palette.colors];
                this.displayPalette();
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '削除';
            deleteBtn.className = 'delete';
            deleteBtn.addEventListener('click', () => {
                if (confirm('このパレットを削除しますか？')) {
                    this.savedPalettesData = this.savedPalettesData.filter(p => p.id !== palette.id);
                    this.savePalettesToStorage();
                    this.displaySavedPalettes();
                }
            });
            
            actionsDiv.appendChild(loadBtn);
            actionsDiv.appendChild(deleteBtn);
            
            paletteDiv.appendChild(nameDiv);
            paletteDiv.appendChild(colorsDiv);
            paletteDiv.appendChild(actionsDiv);
            
            this.savedPalettes.appendChild(paletteDiv);
        });
    }
    
    savePalettesToStorage() {
        localStorage.setItem('colorToolPalettes', JSON.stringify(this.savedPalettesData));
    }
    
    loadSavedPalettes() {
        const saved = localStorage.getItem('colorToolPalettes');
        return saved ? JSON.parse(saved) : [];
    }
    
    isValidHex(hex) {
        return /^#[0-9A-F]{6}$/i.test(hex);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s * 100, l: l * 100 };
    }
    
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, v = max;
        
        const d = max - min;
        s = max === 0 ? 0 : d / max;
        
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s * 100, v: v * 100 };
    }
    
    hsvToRgb(h, s, v) {
        h /= 360;
        s /= 100;
        v /= 100;
        
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        let r, g, b;
        
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    parseRgb(rgbString) {
        const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return match ? {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        } : null;
    }
    
    parseHsl(hslString) {
        const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        return match ? {
            h: parseInt(match[1]),
            s: parseInt(match[2]),
            l: parseInt(match[3])
        } : null;
    }
    
    parseHsv(hsvString) {
        const match = hsvString.match(/hsv\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        return match ? {
            h: parseInt(match[1]),
            s: parseInt(match[2]),
            v: parseInt(match[3])
        } : null;
    }
    
    calculateContrast(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        const l1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
        const l2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    getRelativeLuminance(r, g, b) {
        const rsRGB = r / 255;
        const gsRGB = g / 255;
        const bsRGB = b / 255;
        
        const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        
        return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ColorTool();
});