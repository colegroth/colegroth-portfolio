import { Renderer, Triangle, Program, Mesh } from 'https://esm.sh/ogl';

const CONFIG = {
    glow: 0.35,
    noise: 0.02,
    opacity: 0.7,
    colorFrequency: 1.2,
    hueShift: 0,
    prismScale: 3.2,
    height: 3,
    baseWidth: 5.8,
    timeScale: 0.25,
    steps: 90
};

const container = document.getElementById('prism-container');

if (container) {
    // Apply initial styles
    container.style.opacity = CONFIG.opacity;

    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl;
    
    // Fill the container (which is now just 100vh)
    Object.assign(gl.canvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        display: 'block'
    });
    container.appendChild(gl.canvas);

    const vertex = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragment = `
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform float uHeight;
        uniform float uBaseHalf;
        uniform float uTimeScale;
        uniform float uGlow;
        uniform float uNoise;
        uniform float uCFreq;
        uniform float uScale;

        vec4 tanh4(vec4 x){
            vec4 e2x = exp(2.0*x);
            return (e2x - 1.0) / (e2x + 1.0);
        }

        float rand(vec2 co){
            return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main(){
            vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy) / (iResolution.y * 0.1 * uScale);
            float z = 5.0;
            vec4 o_col = vec4(0.0);
            
            float t = iTime * uTimeScale;
            float c0 = cos(t);
            float c1 = cos(t + 33.0);
            float c2 = cos(t + 11.0);
            mat2 wob = mat2(c0, c1, c2, c0);
            
            for (int i = 0; i < ${CONFIG.steps}; i++) {
                vec3 p = vec3(f, z);
                p.xz = p.xz * wob; 
                vec3 q = abs(p);
                float m = (q.x / uBaseHalf) + (q.y / uHeight) + (q.z / uBaseHalf) - 1.0;
                float d = 0.08 + 0.3 * abs(m);
                z -= d;
                o_col += (sin((p.y + z) * uCFreq + vec4(0.0, 1.2, 2.4, 3.6)) + 1.0) / d;
            }
            
            o_col = tanh4(o_col * o_col * (uGlow / 1.5e5));
            float n = rand(gl_FragCoord.xy + vec2(iTime));
            vec3 finalRGB = o_col.rgb + (n - 0.5) * uNoise;
            gl_FragColor = vec4(finalRGB, o_col.a * 1.5);
        }
    `;

    const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new Float32Array([0, 0]) },
            uHeight: { value: CONFIG.height },
            uBaseHalf: { value: CONFIG.baseWidth * 0.5 },
            uTimeScale: { value: CONFIG.timeScale },
            uGlow: { value: CONFIG.glow },
            uNoise: { value: CONFIG.noise },
            uCFreq: { value: CONFIG.colorFrequency },
            uScale: { value: CONFIG.prismScale }
        }
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    // Sizing: Only needs to match the container (100vh), not the whole doc
    const resize = () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        program.uniforms.iResolution.value.set([gl.drawingBufferWidth, gl.drawingBufferHeight]);
    };
    window.addEventListener('resize', resize);
    resize();

    // PERFORMANCE ENGINE: Only animate when visible
    let animationId;
    let isVisible = true;

    const render = (t) => {
        if (!isVisible) return; // Stop logic if off-screen
        
        program.uniforms.iTime.value = t * 0.001;
        renderer.render({ scene: mesh });
        animationId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                isVisible = true;
                if (!animationId) animationId = requestAnimationFrame(render);
            } else {
                isVisible = false;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
        });
    }, { threshold: 0 });

    observer.observe(container);
}