/**
 * midn_session.js - Crea sesión autenticada en MIDN sin Puppeteer/Chrome
 * 
 * Flujo:
 * 1. Token JWT vía REST API de Magento (sin reCAPTCHA)
 * 2. Sesión PHP autenticada via section/load con Bearer token
 * 3. Cookies extcompany/extsucursal para la extensión B2B de la droguería
 * 4. Form key generado dinámicamente
 * 
 * Usage: node midn_session.js <rut> <email> <password>
 * Output: JSON con cookies_sesion listas para usar
 */

const https = require('https');

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ 
                statusCode: res.statusCode, 
                headers: res.headers, 
                body: data,
                cookies: parseCookies(res.headers['set-cookie'])
            }));
        });
        req.on('error', reject);
        req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
        if (postData) req.write(postData);
        req.end();
    });
}

function parseCookies(setCookieHeaders) {
    if (!setCookieHeaders) return {};
    const cookies = {};
    (Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders]).forEach(header => {
        const [nameValue] = header.split(';');
        const [name, ...valueParts] = nameValue.split('=');
        cookies[name.trim()] = valueParts.join('=').trim();
    });
    return cookies;
}

function generateFormKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

(async () => {
    const rut = process.argv[2];
    const email = process.argv[3];
    const password = process.argv[4];
    const sucursalParam = process.argv[5] || '27086'; // Default sucursal

    if (!rut || !email || !password) {
        console.log(JSON.stringify({success: false, error: "Faltan credenciales (rut, email, password, [sucursal])"}));
        process.exit(1);
    }

    // Normalizar RUT: quitar puntos, mantener guión para la cookie extcompany
    const rutConGuion = rut.replace(/\./g, '');
    // Asegurar que tiene guión (si no lo tiene, insertar antes del último dígito)
    const rutFormateado = rutConGuion.includes('-') ? rutConGuion : 
        rutConGuion.slice(0, -1) + '-' + rutConGuion.slice(-1);

    try {
        // Step 1: Get JWT token via REST API (bypasses reCAPTCHA completely)
        const tokenData = JSON.stringify({username: email, password: password});
        const tokenRes = await makeRequest({
            hostname: 'www.midn.cl',
            port: 443,
            path: '/rest/V1/integration/customer/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(tokenData),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            rejectUnauthorized: false
        }, tokenData);

        const token = JSON.parse(tokenRes.body);
        if (typeof token !== 'string' || token.length < 10) {
            console.log(JSON.stringify({
                success: false, 
                error: 'No se pudo obtener token JWT: credenciales inválidas o servidor no disponible',
                response: tokenRes.body
            }));
            process.exit(1);
        }

        // Step 2: Create authenticated PHP session via section/load with Bearer token
        const sectionRes = await makeRequest({
            hostname: 'www.midn.cl',
            port: 443,
            path: '/customer/section/load/?sections=cart,customer&force_new_section_timestamp=true',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            rejectUnauthorized: false
        });

        const phpsessid = sectionRes.cookies['PHPSESSID'];
        if (!phpsessid) {
            console.log(JSON.stringify({success: false, error: 'No se obtuvo PHPSESSID'}));
            process.exit(1);
        }

        // Step 3: Use provided sucursal ID (from stored cookies or parameter)
        const sucursalId = sucursalParam;

        // Step 4: Build the complete cookie string with extcompany data
        const formKey = generateFormKey();
        
        // Construir cookie extcompany (JSON URL-encoded)
        const extcompanyData = {
            ext: email.toUpperCase(),
            rut: rutFormateado,
            suc: JSON.stringify([sucursalId]),
            loginOption: "2"
        };
        const extcompanyCookie = encodeURIComponent(JSON.stringify(extcompanyData));
        
        // Construir cookie extsucursal
        const extsucursalData = { suc: sucursalId };
        const extsucursalCookie = encodeURIComponent(JSON.stringify(extsucursalData));

        const cookieString = [
            `PHPSESSID=${phpsessid}`,
            `form_key=${formKey}`,
            `extcompany=${extcompanyCookie}`,
            `extsucursal=${extsucursalCookie}`,
            `mage-cache-sessid=true`,
            `private_content_version=${Date.now()}`
        ].join('; ');

        console.log(JSON.stringify({
            success: true,
            cookies_sesion: cookieString,
            token_jwt: token,
            form_key: formKey,
            phpsessid: phpsessid,
            sucursal: sucursalId
        }));

    } catch(e) {
        console.log(JSON.stringify({success: false, error: e.toString()}));
    }
})();
