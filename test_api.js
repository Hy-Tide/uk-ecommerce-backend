const http = require('http');

http.get('http://localhost:5000/website/products?category=spices', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", data.substring(0, 300));
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
});
