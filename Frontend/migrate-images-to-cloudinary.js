const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// ============================================
// CONFIGURACIÓN DE CLOUDINARY
// ============================================
cloudinary.config({
  cloud_name: 'asosiec',
  api_key: '332443336934163',      
  api_secret: 'iOaWmiTFoVFhWElBTcE7Qoy0Wac'   
});

// ============================================
// CONFIGURACIÓN DE RUTAS
// ============================================
const IMAGES_DIR = './src/assets/Images/productos/';
const CSV_FILE = './productos.csv';
const CLOUDINARY_FOLDER = 'asosiec/productos';

// ============================================
// MAPEO DE CATEGORÍAS
// ============================================
const categorias = {
  1: 'bisuteria',
  2: 'decoracion',
  3: 'textil',
  4: 'alimento',
  5: 'ceramica',
  6: 'ofertas'
};

// ============================================
// ALMACENAMIENTO DE RESULTADOS
// ============================================
const resultados = [];
let sqlStatements = [];

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function migrateImages() {
  console.log('🚀 Iniciando migración de imágenes a Cloudinary...\n');

  // Leer el CSV
  const productos = await leerProductosCSV();
  console.log(`📦 Productos encontrados: ${productos.length}\n`);

  // Filtrar productos con imágenes locales (no URLs de Cloudinary)
  const productosAMigrar = productos.filter(p => 
    !p.url_Img.startsWith('http') && p.url_Img !== 'prueba.jpg'
  );

  console.log(`📸 Productos a migrar: ${productosAMigrar.length}\n`);
  console.log('⏳ Subiendo imágenes...\n');

  // Subir cada imagen
  for (const producto of productosAMigrar) {
    await subirImagen(producto);
  }

  // Generar SQL
  generarSQL();

  // Guardar resultados
  guardarResultados();

  console.log('\n✅ ¡Migración completada!');
  console.log('\n📋 Archivos generados:');
  console.log('   - migration-results.json (log de URLs)');
  console.log('   - update-productos-urls.sql (ejecutar en SQL Server)');
}

// ============================================
// LEER PRODUCTOS DEL CSV
// ============================================
function leerProductosCSV() {
  return new Promise((resolve, reject) => {
    const productos = [];
    
    fs.createReadStream(CSV_FILE)
      .pipe(csv({
        separator: ';',
        headers: ['id', 'nombre', 'categoriaId', 'url_Img']
      }))
      .on('data', (row) => {
        productos.push({
          id: parseInt(row.id),
          nombre: row.nombre,
          categoriaId: parseInt(row.categoriaId),
          url_Img: row.url_Img.trim()
        });
      })
      .on('end', () => resolve(productos))
      .on('error', reject);
  });
}

// ============================================
// SUBIR IMAGEN A CLOUDINARY
// ============================================
async function subirImagen(producto) {
  const imagePath = path.join(IMAGES_DIR, producto.url_Img);

  // Verificar si existe el archivo
  if (!fs.existsSync(imagePath)) {
    console.log(`⚠️  [ID ${producto.id}] ${producto.url_Img} - ARCHIVO NO ENCONTRADO`);
    resultados.push({
      id: producto.id,
      nombre: producto.nombre,
      imagenOriginal: producto.url_Img,
      status: 'ERROR',
      error: 'Archivo no encontrado'
    });
    return;
  }

  try {
    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: CLOUDINARY_FOLDER,
      public_id: path.parse(producto.url_Img).name, // Sin extensión
      overwrite: false,
      resource_type: 'image'
    });

    console.log(`✅ [ID ${producto.id}] ${producto.url_Img} -> Cloudinary`);

    resultados.push({
      id: producto.id,
      nombre: producto.nombre,
      imagenOriginal: producto.url_Img,
      cloudinaryUrl: result.secure_url,
      status: 'SUCCESS'
    });

    // Agregar sentencia SQL
    sqlStatements.push({
      id: producto.id,
      url: result.secure_url
    });

  } catch (error) {
    console.log(`❌ [ID ${producto.id}] ${producto.url_Img} - ERROR: ${error.message}`);
    
    resultados.push({
      id: producto.id,
      nombre: producto.nombre,
      imagenOriginal: producto.url_Img,
      status: 'ERROR',
      error: error.message
    });
  }
}

// ============================================
// GENERAR SCRIPT SQL
// ============================================
function generarSQL() {
  let sqlContent = `-- ============================================
-- SCRIPT DE ACTUALIZACIÓN DE URLs DE PRODUCTOS
-- Generado automáticamente
-- Total de productos: ${sqlStatements.length}
-- ============================================

USE [ASOSIEC]
GO

BEGIN TRANSACTION;

`;

  // Generar UPDATE para cada producto
  sqlStatements.forEach(({ id, url }) => {
    sqlContent += `UPDATE producto SET url_Img = '${url}' WHERE id = ${id};\n`;
  });

  sqlContent += `
-- Verificar cambios
SELECT id, nombre_producto, url_Img 
FROM producto 
WHERE id IN (${sqlStatements.map(s => s.id).join(', ')});

COMMIT TRANSACTION;

PRINT '✅ ${sqlStatements.length} productos actualizados correctamente';
`;

  fs.writeFileSync('update-productos-urls.sql', sqlContent);
  console.log('\n📄 SQL generado: update-productos-urls.sql');
}

// ============================================
// GUARDAR RESULTADOS EN JSON
// ============================================
function guardarResultados() {
  const resumen = {
    fecha: new Date().toISOString(),
    total: resultados.length,
    exitosos: resultados.filter(r => r.status === 'SUCCESS').length,
    errores: resultados.filter(r => r.status === 'ERROR').length,
    detalle: resultados
  };

  fs.writeFileSync('migration-results.json', JSON.stringify(resumen, null, 2));
  console.log('📊 Resultados guardados: migration-results.json');
}

// ============================================
// EJECUTAR
// ============================================
migrateImages().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
