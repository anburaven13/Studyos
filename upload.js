const admin = require('firebase-admin');
const serviceAccount = require('./api/service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'studyos-snowy.appspot.com'
});

const bucket = admin.storage().bucket();

async function uploadFile(filePath, destName) {
  try {
    await bucket.upload(filePath, {
      destination: destName,
      public: true,
      metadata: {
        cacheControl: 'public, max-age=31536000'
      }
    });
    console.log('Uploaded ' + destName);
    const file = bucket.file(destName);
    const url = 'https://firebasestorage.googleapis.com/v0/b/studyos-snowy.appspot.com/o/' + encodeURIComponent(destName) + '?alt=media';
    console.log('URL:', url);
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  await uploadFile('./public/hero-bg.mp4', 'public/hero-bg.mp4');
  await uploadFile('./public/feature-bg-1.mp4', 'public/feature-bg-1.mp4');
  await uploadFile('./public/feature-bg-2.mp4', 'public/feature-bg-2.mp4');
}

run();
