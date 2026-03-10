const cloudinary = require('cloudinary').v2;
const path = require('path');

// ============================================
// SCRIPT DE PRUEBA - SUBIR UNA IMAGEN
// ============================================
// Usa este script primero para verificar que
// tus credenciales de Cloudinary funcionan
// ============================================

cloudinary.config({
  cloud_name: 'asosiec',
  api_key: '332443336934163',          // ⚠️ REEMPLAZA
  api_secret: 'iOaWmiTFoVFhWElBTcE7Qoy0Wac'     // ⚠️ REEMPLAZA
});

async function testUpload() {
  try {
    console.log('🧪 Probando conexión con Cloudinary...\n');

    const testImage = './src/assets/Images/productos/textil1.png';
    
    console.log(`📸 Subiendo imagen de prueba: ${testImage}\n`);

    const result = await cloudinary.uploader.upload(testImage, {
      folder: 'asosiec/productos',
      public_id: 'test-upload',
      overwrite: true
    });

    console.log('✅ ¡Éxito! Imagen subida correctamente\n');
    console.log('📋 Detalles:');
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Formato: ${result.format}`);
    console.log(`   Tamaño: ${result.bytes} bytes`);
    console.log(`   Dimensiones: ${result.width}x${result.height}px\n`);
    console.log('✅ Tu configuración es correcta. Puedes ejecutar el script completo.');

  } catch (error) {
    console.error('❌ Error al subir imagen:', error.message);
    console.error('\n⚠️  Verifica:');
    console.error('   1. Que tu API Key y API Secret sean correctos');
    console.error('   2. Que la ruta de la imagen sea correcta');
    console.error('   3. Que tengas conexión a internet');
  }
}

testUpload();
