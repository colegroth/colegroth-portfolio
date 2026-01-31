async function loadComponent(id, file) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
        const response = await fetch(`components/${file}`);
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        container.innerHTML = await response.text();
    } catch (error) { console.error(error); }
}

async function init() {
    await Promise.all([
        loadComponent('navbar-container', 'navbar.html'),
        loadComponent('hero-container', 'hero.html'),
        loadComponent('narrative-container', 'narrative.html'),
        loadComponent('commercial-container', 'commercial.html'),
        loadComponent('screenwriting-container', 'screenwriting.html'),
        loadComponent('about-container', 'about.html')
    ]);
    document.dispatchEvent(new Event('contentLoaded'));
}
init();