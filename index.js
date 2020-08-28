const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Serve front-end web files from the public folder
app.use(express.static('public'));

// Accept POST bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/signature/', (req, res) => {

  console.log(req.body);

  // TODO: delete this
  res.send(req.body);

  // Post the signature on-chain using web3

  // Poke the smart contract (needs to know the address)

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
