document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const output = document.getElementById('output');
    const convertButton = document.getElementById('convert');
    const copyButton = document.getElementById('copy');
    const copyBalloon = document.getElementById('copyBalloon');

    // Convert markdown to HTML and display preview
    convertButton.addEventListener('click', () => {
        const markdown = editor.value;
        const html = marked(markdown);
        // XSS対策: DOMPurifyでサニタイズ
        preview.innerHTML = DOMPurify.sanitize(html);
        output.textContent = html;
    });

    // Copy HTML output to clipboard and show feedback
    copyButton.addEventListener('click', () => {
        const htmlOutput = output.textContent;
        navigator.clipboard.writeText(htmlOutput).then(() => {
            copyBalloon.classList.add('show');
            setTimeout(() => {
                copyBalloon.classList.remove('show');
            }, 1000); // バルーンを1秒後に非表示にする
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });
});