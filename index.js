const express = require('express');
const bodyParser = require('body-parser');
const { delegate } = require('./delegate');
const app = express();
const port = 3000;

// Serve front-end web files from the public folder
app.use(express.static('public'));

// Accept POST bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/signature/', async (req, res) => {

  console.log(req.body);

  const nonce = req.body.nonce || 0;
  const expiry = req.body.expiry || 10000000000;
  const v = req.body.v || "0x1b";
  const r = req.body.r || "0x655b304ad68d8f16dd7b268a8176e0f972728c16ec54e0e6831b8d6f98159679";
  const s = req.body.s || "0x4701e1a63a1be5e73fe4b236572cb9e8192d7e1ea13314439e1d08fb94fc5afd";

  const delegateRes = await delegate(nonce, expiry, v, r, s);

  // Post the signature on-chain using web3

  // Poke the smart contract (needs to know the address)

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
