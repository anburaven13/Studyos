import { auth } from './api/firebase-admin.js';

auth.generatePasswordResetLink('keya.ghosh3110@gmail.com')
  .then(link => console.log('Link:', link))
  .catch(err => console.error('Error:', err.message));
