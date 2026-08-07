const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const rut = process.argv[2];
    const email = process.argv[3];
    const password = process.argv[4];

    if (!rut || !email || !password) {
        console.error(JSON.stringify({success: false, error: "Faltan credenciales"}));
        process.exit(1);
    }

    // Normalizar el RUT: quitar puntos y guión para que quede solo como dígitos+DV
    // El formulario dice "sin puntos ni guión"
    const rutLimpio = rut.replace(/[.\-]/g, '');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-size=1280,800',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        
        // Interceptar requests de ReCaptcha para no bloquear
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            req.continue();
        });

        // Vamos a la página de login
        await page.goto('https://www.midn.cl/extcompany/account/login/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Esperamos que cargue el formulario
        await page.waitForSelector('input[name="login[rut_company]"]', {timeout: 15000});

        // Esperar un poco para que JS cargue completamente
        await new Promise(r => setTimeout(r, 2000));

        // Limpiar campos primero (por si tienen valor pre-rellenado)
        await page.evaluate(() => {
            const fields = ['login[rut_company]', 'login[username]', 'login[password]'];
            fields.forEach(name => {
                const el = document.querySelector(`input[name="${name}"]`);
                if (el) el.value = '';
            });
        });

        // Escribimos las credenciales con delay para simular usuario humano
        await page.type('input[name="login[rut_company]"]', rutLimpio, {delay: 80});
        await page.type('input[name="login[username]"]', email, {delay: 80});
        await page.type('input[name="login[password]"]', password, {delay: 80});

        // Seleccionamos la opción "2" (Home) con click real
        await page.evaluate(() => {
            const radio = document.querySelector('input[name="login[option]"][value="2"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                radio.dispatchEvent(new Event('click', { bubbles: true }));
            }
        });

        // Esperamos para que ReCaptcha V3 genere el token (si existe)
        await new Promise(r => setTimeout(r, 5000));

        // Forzar la inyección del form_key desde las cookies al input oculto
        const currentCookies = await page.cookies();
        const formKeyCookie = currentCookies.find(c => c.name === 'form_key');
        if (formKeyCookie) {
            await page.evaluate((fk) => {
                const input = document.querySelector('input[name="form_key"]');
                if (input) input.value = fk;
            }, formKeyCookie.value);
        }

        // Intentar ejecutar el ReCaptcha v3 manualmente si existe
        await page.evaluate(() => {
            if (typeof grecaptcha !== 'undefined' && grecaptcha.execute) {
                try {
                    // Buscar el sitekey del reCaptcha
                    const recaptchaEl = document.querySelector('.g-recaptcha');
                    const sitekey = recaptchaEl ? recaptchaEl.getAttribute('data-sitekey') : null;
                    if (sitekey) {
                        grecaptcha.execute(sitekey, {action: 'login'}).then(function(token) {
                            const input = document.querySelector('input[name="g-recaptcha-response"]') || 
                                         document.querySelector('textarea[name="g-recaptcha-response"]');
                            if (input) input.value = token;
                        });
                    }
                } catch(e) {}
            }
        });

        // Esperar un segundo más para que el token de reCaptcha se propague
        await new Promise(r => setTimeout(r, 1500));

        // Hacemos click en el botón de iniciar sesión
        try {
            await Promise.all([
                page.waitForNavigation({waitUntil: 'networkidle2', timeout: 30000}),
                page.evaluate(() => {
                    const btn = document.querySelector('button#send2') || 
                               document.querySelector('button[type="submit"]');
                    if (btn) btn.click();
                })
            ]);
        } catch(navErr) {
            // Si la navegación falla por timeout, puede que haya cargado parcialmente
        }

        // Screenshot para debug
        try {
            await page.screenshot({path: '/tmp/debug_nunoa_login.png', fullPage: true});
        } catch(e) {}

        // Verificar si el login fue exitoso - chequeamos la URL actual
        const currentUrl = page.url();
        const loginExitoso = !currentUrl.includes('/extcompany/account/login') && 
                            !currentUrl.includes('/customer/account/login');

        // Obtenemos todas las cookies
        const cookies = await page.cookies();
        let cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        if (loginExitoso) {
            console.log(JSON.stringify({
                success: true,
                cookies_sesion: cookieString
            }));
        } else {
            // Aunque el login no fue exitoso visualmente, las cookies pueden ser válidas
            // si hay un PHPSESSID y form_key
            const hasPHP = cookies.some(c => c.name === 'PHPSESSID');
            const hasFormKey = cookies.some(c => c.name === 'form_key');
            
            console.log(JSON.stringify({
                success: false,
                error: 'Login redirigió de vuelta a login (posible bloqueo de ReCaptcha v3)',
                url_final: currentUrl,
                cookies_sesion: cookieString,
                tiene_phpsessid: hasPHP,
                tiene_form_key: hasFormKey
            }));
        }
    } catch(e) {
        console.error(JSON.stringify({success: false, error: e.toString()}));
    } finally {
        if (browser) await browser.close();
    }
})();
