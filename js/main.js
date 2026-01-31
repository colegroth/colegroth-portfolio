const videoMap = {
    'gators-spring': 'https://www.youtube.com/embed/TKTtru1CUHw',
    'disney': 'https://www.youtube.com/embed/qcL2K3PCG6U',
    'gators-fall': 'https://www.youtube.com/embed/5NSpI2UnDFE',
    'orange-blue-25': 'https://www.youtube.com/embed/xmlDxJiLF1k',
    'orange-blue-24': 'https://www.youtube.com/embed/De9ohRr7GUM',
    'agency': 'https://www.youtube.com/embed/4TeYR_tW5Ts',
    'out-to-lunch': 'https://www.youtube.com/embed/iV0mqMiMTdk',
    'guy-money': 'https://www.youtube.com/embed/6F3xeKoHV1s',
    'groundhog': 'https://www.youtube.com/embed/T6nu1JVrTfc'
};

// --- MODAL LOGIC ---
window.openVideo = (id) => {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('modalPlayer');
    if (modal && iframe && videoMap[id]) {
        iframe.src = videoMap[id];
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
};

window.closeModal = () => {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('modalPlayer');
    if (modal) modal.classList.remove('active');
    if (iframe) iframe.src = ''; 
    document.body.style.overflow = ''; 
};

window.openPdf = (url) => {
    window.open(url, '_blank');
};

window.requestScript = (title) => {
    const subject = encodeURIComponent(`Script Request: ${title}`);
    window.location.href = `mailto:cole@colegroth.com?subject=${subject}`;
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeModal();
});

// --- NAVIGATION & CLEAN URL LOGIC ---
document.addEventListener('contentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link, .btn-glass');
    const sections = document.querySelectorAll('section, footer');

    // 1. Initial Load: Check path and scroll
    const handleInitialPath = () => {
        const path = window.location.pathname.replace(/^\/|\/$/g, '');
        if (path && path !== 'index.html' && path !== 'home') {
            const targetElement = document.getElementById(path);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'auto' });
                }, 200); // Increased delay for local component rendering
            }
        }
    };

    handleInitialPath();

    // 2. Click Handling (Intercept # to show clean URLs)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    
                    const cleanPath = targetId === 'hero' ? '/' : `/${targetId}`;
                    history.pushState(null, null, cleanPath);
                }
            }
        });
    });

    // 3. Scroll Spy (Update URL on scroll)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const cleanPath = id === 'hero' ? '/' : `/${id}`;
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });

                if (window.location.pathname !== cleanPath) {
                    history.replaceState(null, null, cleanPath);
                }
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(section => {
        if (section.id) observer.observe(section);
    });
});