document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.filter-btn');
    const displayArea = document.getElementById('data-display');
    const themeBtn = document.getElementById('theme-toggle');

    // === 1. Data Fetching with Link Detection ===
    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const fileName = btn.getAttribute('data-file');
            
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            displayArea.innerHTML = '<div class="placeholder-box">Fetching live data...</div>';

            try {
                const response = await fetch(fileName);
                if (!response.ok) throw new Error('File Error');

                const rawText = await response.text();
                const lines = rawText.split('\n').filter(l => l.trim() !== "");

                if (lines.length > 0) {
                    displayArea.innerHTML = lines.map(line => {
                        const content = line.trim();
                        const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
                        
                        const linkedText = content.replace(urlPattern, (url) => {
                            const fullUrl = url.startsWith('www') ? `https://${url}` : url;
                            return `<a href="${fullUrl}" target="_blank" class="data-link">${url} ↗</a>`;
                        });

                        const isJustLink = content.startsWith('http') || content.startsWith('www');

                        return `
                            <div class="contribution-item">
                                ${isJustLink ? linkedText : content}
                            </div>`;
                    }).join('');
                } else {
                    displayArea.innerHTML = '<div class="placeholder-box">No records found.</div>';
                }
            } catch (err) {
                displayArea.innerHTML = `<div class="placeholder-box" style="color:var(--owasp-cyan)">Error: Could not load data.</div>`;
            }
        });
    });

    // === 2. Theme Toggle ===
    themeBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        themeBtn.innerText = newTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('owasp-theme', newTheme);
    });

    const savedTheme = localStorage.getItem('owasp-theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    themeBtn.innerText = savedTheme === 'dark' ? '☀️' : '🌙';
});