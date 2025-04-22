require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

// Configurar Dropbox con el token de acceso
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch });

const UPLOADS_DIR = path.join(__dirname, "uploads");

async function uploadImages() {
  const suites = fs.readdirSync(UPLOADS_DIR); // Leer las carpetas suite1, suite2, suite3

  for (const suite of suites) {
    const suitePath = path.join(UPLOADS_DIR, suite);
    if (!fs.lstatSync(suitePath).isDirectory()) continue;

    const files = fs.readdirSync(suitePath); // Leer imágenes dentro de cada suite

    for (const file of files) {
      const filePath = path.join(suitePath, file);
      const dropboxPath = `/suites/${suite}/${file}`; // Ruta en Dropbox

      try {
        const imageData = fs.readFileSync(filePath);
        const response = await dbx.filesUpload({ path: dropboxPath, contents: imageData });
        const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({ path: response.result.path_display });

        const imageUrl = sharedLink.result.url.replace("?dl=0", "?raw=1"); // Hacer el link accesible

        console.log(`✅ Imagen subida: ${imageUrl}`);
        // Aquí puedes llamar una función para guardar en PostgreSQL
      } catch (error) {
        console.error(`❌ Error subiendo ${file}:`, error);
      }
    }
  }
}

uploadImages();
