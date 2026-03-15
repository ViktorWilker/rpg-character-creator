require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Erro:', err.message);
    process.exit(1);
  });