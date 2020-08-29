const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const compAbi = require('./compAbi.json');
const kickstarterAbi = require('./kickstarter.json');
const kickstarterAddress = '0x02630b576b136d01Fe0BDD784a35dd4ec4952809';
const compAddress = '0x61460874a7196d6a22D1eE4922473664b3E95270';
const app = express();
const port = 3000;

// Serve front-end web files from the public folder
app.use(express.static('public'));

// Accept POST bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const web3 = new Web3('https://kovan-eth.compound.finance/');
const testnetKey = '57df88dc21bfec871829bbb2f26d7dbb3e5e034667a3264c11ff5c2c18968828';
web3.eth.accounts.wallet.add('0x' + testnetKey);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

const comp = new web3.eth.Contract(compAbi, compAddress);
const kickstarter = new web3.eth.Contract(kickstarterAbi, kickstarterAddress);

app.post('/signature/', async (req, res) => {

  console.log(req.body);

  const delegatee = req.body.delegatee;
  const nonce = req.body.nonce;
  const expiry = req.body.expiry;
  const v = req.body.v;
  const r = req.body.r;
  const s = req.body.s;

  res.send(200);

  try {
    let tx = await comp.methods.delegateBySig(
      delegatee, nonce, expiry, v, r, s
    ).send({
      from: myWalletAddress,
      gasLimit: web3.utils.toHex(150000),
      gasPrice: web3.utils.toHex(20000000000),
    });

    console.log('post signature: ', tx.transactionHash);
  } catch(e) {
    console.error('Error posting signature: ', e);
  }

  try {
    let tx = await kickstarter.methods.submitProposal().send({
      from: myWalletAddress,
      gasLimit: web3.utils.toHex(150000),
      gasPrice: web3.utils.toHex(20000000000),
    });

    console.log('submit proposal:', tx.transactionHash);
  } catch(e) {
    console.error('Error submitting proposal: ', e);
  }

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
