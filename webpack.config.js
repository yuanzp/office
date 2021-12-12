const path = require('path');
 
module.exports = {
  entry: './app.js',
  output: {
    filename: 'office-app.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'node' // 这是最关键的
};