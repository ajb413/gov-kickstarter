const express = require('express');
const app = express();
const port = 3000;

// Serve front-end web files from the public folder
app.use(express.static('public'));


app.post('/signature/', (req, res) => {

  // TODO: delete this
  res.send('Hello World!');

  // Post the signature on-chain using web3

  // Poke the smart contract (needs to know the address)

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
