const Dropbox = require('dropbox').Dropbox;
const { Pool } = require('pg');
require('dotenv').config();

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

/**
 * Pausa la ejecución para evitar limitaciones de Dropbox.
 * @param {number} ms - Milisegundos a esperar.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Obtiene la lista de imágenes dentro de una carpeta en Dropbox.
 */
async function getImagesFromDropbox(folderPath) {
    try {
        console.log(`Listando archivos en: ${folderPath}`);
        const response = await dbx.filesListFolder({ path: folderPath });
        const images = response.result.entries
            .filter(file => file[".tag"] === "file")
            .map(file => file.path_lower);
        console.log(`Encontradas ${images.length} imágenes en ${folderPath}`);
        return images;
    } catch (error) {
        console.error("Error obteniendo imágenes:", error);
        return [];
    }
}

/**
 * Obtiene un enlace público para un archivo en Dropbox.
 */
async function getSharedLink(filePath) {
    try {
        const response = await dbx.sharingCreateSharedLinkWithSettings({ path: filePath });
        return response.result.url.replace('?dl=0', '?raw=1');
    } catch (error) {
        if (error?.error?.error?.['.tag'] === 'shared_link_already_exists') {
            const links = await dbx.sharingListSharedLinks({ path: filePath });
            return links.result.links[0].url.replace('?dl=0', '?raw=1');
        } else if (error.status === 429) {
            console.warn(`Demasiadas solicitudes a Dropbox. Esperando 2 segundos...`);
            await sleep(2000); // Espera antes de reintentar
            return getSharedLink(filePath);
        }
        console.error("Error obteniendo el enlace compartido:", error);
        return null;
    }
}

/**
 * Guarda las imágenes en la base de datos.
 */
async function saveImagesToDatabase(suiteId, imageUrls) {
    try {
        const client = await pool.connect();
        for (const url of imageUrls) {
            await client.query(
                'INSERT INTO suite_images (suite_id, image_url) VALUES ($1, $2)',
                [suiteId, url]
            );
        }
        client.release();
        console.log(`Guardadas ${imageUrls.length} imágenes para suite ${suiteId}`);
    } catch (error) {
        console.error("Error guardando imágenes en la base de datos:", error);
    }
}

/**
 * Procesa todas las suites y almacena las imágenes en la base de datos.
 */
async function processSuites() {
    const suites = [
        { id: 1, path: '/suites/suite1' },
        { id: 2, path: '/suites/suite2' },
        { id: 3, path: '/suites/suite3' }
    ];

    for (const suite of suites) {
        console.log(`Procesando imágenes para suite ${suite.id}...`);
        const images = await getImagesFromDropbox(suite.path);
        if (images.length === 0) {
            console.warn(`No se encontraron imágenes en ${suite.path}`);
            continue;
        }

        const imageUrls = [];
        for (const image of images) {
            const url = await getSharedLink(image);
            if (url) imageUrls.push(url);
            await sleep(500); // Evita el límite de Dropbox
        }

        if (imageUrls.length > 0) {
            await saveImagesToDatabase(suite.id, imageUrls);
        } else {
            console.warn(`No se pudieron generar enlaces para suite ${suite.id}`);
        }
    }
}

// Ejecutar la función principal
processSuites();
