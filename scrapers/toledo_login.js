const puppeteer = require('puppeteer');

(async () => {
    const rut = process.argv[2];
    const password = process.argv[3];

    if (!rut || !password) {
        console.log(JSON.stringify({ success: false, error: "Faltan credenciales" }));
        process.exit(1);
    }

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        await page.goto('https://drogueriatoledo.cl/b2b/', { waitUntil: 'networkidle2' });

        // Click en "INGRESAR"
        await page.evaluate(() => {
            if (typeof CargarContenidoSitio === 'function') {
                CargarContenidoSitio('Login');
            } else {
                const btn = document.querySelector('.NvarBoton5');
                if (btn) btn.click();
            }
        });

        // Esperar un poco a que cargue el form o popup
        await new Promise(r => setTimeout(r, 2000));

        // Llenar RUT y Pass (según el curl parece que son campos con name user y password o id)
        // No sabemos los IDs exactos, pero intentaremos inyectar el form post directamente a eco_Login
        // O buscar los inputs
        // Mejor intentamos usar la función fetch del navegador para hacer el login usando el token que ya está en la página!
        const result = await page.evaluate(async (user, pass) => {
            const tokenInput = document.querySelector('input[name="_token"]');
            const token = tokenInput ? tokenInput.value : '';
            
            const formData = new URLSearchParams();
            formData.append('_token', token);
            formData.append('user', user);
            formData.append('password', pass);

            const res = await fetch('https://drogueriatoledo.cl/eco_Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });
            const text = await res.text();
            return text;
        }, rut, password);

        // Si falló el CSRF mismatch lo sabremos por result
        if (result.includes("CSRF token mismatch")) {
             throw new Error("CSRF token mismatch");
        }

        // Obtener las cookies
        const cookies = await page.cookies();
        const cookiesStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        console.log(JSON.stringify({
            success: true,
            cookies_sesion: cookiesStr
        }));

        await browser.close();

    } catch (err) {
        console.log(JSON.stringify({ success: false, error: err.message }));
        process.exit(1);
    }
})();
