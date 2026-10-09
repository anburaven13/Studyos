const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function uploadToCatbox(filePath) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', fs.createReadStream(filePath));
  
  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  });
  
  const url = await res.text();
  console.log(filePath + ' -> ' + url);
}

async function run() {
  await uploadToCatbox('./public/hero-bg.mp4');
  await uploadToCatbox('./public/feature-bg-1.mp4');
  await uploadToCatbox('./public/feature-bg-2.mp4');
}

run();
