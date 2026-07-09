import http from 'http';

const loginData = JSON.stringify({
  email: 'admin@propms.com',
  password: 'Admin@123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5183,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(loginOptions, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const token = JSON.parse(body).token;

    const propData = JSON.stringify({
      name: "Node Prop",
      address: "123 node st",
      unitCount: 2,
      units: [
        { unitIdentifier: "A", bedrooms: 1, bathrooms: 1, monthlyRent: 100 },
        { unitIdentifier: "B", bedrooms: 1, bathrooms: 1, monthlyRent: 200 }
      ]
    });

    const propOptions = {
      hostname: 'localhost',
      port: 5183,
      path: '/api/properties',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': propData.length
      }
    };

    const req2 = http.request(propOptions, res2 => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
         console.log(res2.statusCode);
         console.log(body2);
      });
    });
    req2.write(propData);
    req2.end();
  });
});

req.write(loginData);
req.end();
