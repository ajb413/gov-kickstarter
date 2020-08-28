const createSignature = document.getElementById('create-signature');
const signatureDisplay = document.getElementById('signature-display');
const submitSignature = document.getElementById('submit-signature');

const createDelegateBySigMessage = (compAddress, delegatee, expiry = 10e9, chainId = 1, nonce = 0) => {
  const types = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Delegation: [
      { name: 'delegatee', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'expiry', type: 'uint256' }
    ]
  };

  const primaryType = 'Delegation';
  const domain = { name: 'Compound', chainId, verifyingContract: compAddress };
  const message = { delegatee, nonce, expiry };

  return JSON.stringify({ types, primaryType, domain, message });
};

window.addEventListener('load', () => {

  if (typeof window.ethereum === 'undefined') {
    console.error('Client does not have an active Web3 provider or the example app is not being run from an HTTP server.');
    console.log('Go here to install MetaMask: https://metamask.io/');
    alert(
      'You need a Web3 provider to run this page. ' + 
      'Go here to install MetaMask:\n\n' +
      'https://metamask.io/'
    );
    web3Warning.classList.remove('hidden');
  } else {
    main();
  }

  let myAddress = '';

  async function main() {
    web3 = new Web3(web3.currentProvider);

    const mySignature = {};

    const compAddress = '0x61460874a7196d6a22d1ee4922473664b3e95270';
    const proposingContractAddress = '0x9c3dd2443CC4AD16d367105bBd89Ae8077f2B069';
    const compAbi = window.compAbi;
    const comp = new web3.eth.Contract(compAbi, compAddress);

    const accounts = await window.ethereum.enable();
    const myAccount = accounts[0];

    myAddress = myAccount;

    createSignature.onclick = async () => {
      const _delegatee = proposingContractAddress;
      const _nonce = await comp.methods.nonces(myAccount).call();
      const _expiry = 10e9; // expiration of signature, in seconds since unix epoch
      const _chainId = web3.currentProvider.networkVersion;
      const msgParams = createDelegateBySigMessage(compAddress, _delegatee, _expiry, _chainId, _nonce);

      web3.currentProvider.sendAsync({
        method: 'eth_signTypedData_v4',
        params: [ myAccount, msgParams ],
        from: myAccount
      }, async (err, result) => {
        if (err) {
          console.error('ERROR', err);
          alert(err);
          return;
        } else if (result.error) {
          console.error('ERROR', result.error.message);
          alert(result.error.message);
          return;
        }

        const sig = result.result;

        mySignature.delegatee = _delegatee;
        mySignature.nonce = _nonce;
        mySignature.expiry = _expiry;
        mySignature.signature = sig;

        signatureDisplay.innerText = sig;

        console.log('signature', sig);
        console.log('msgParams', JSON.parse(msgParams));
      });
    };

    submitSignature.onclick = async () => {
      const _delegatee = mySignature.delegatee;
      const _nonce = mySignature.nonce;
      const _expiry = mySignature.expiry;
      const sig = mySignature.signature;

      if (
        !_delegatee ||
        !_nonce ||
        !_expiry ||
        !sig
      ) {
        console.log('No signature yet. Cannot POST.');
        return;
      }

      const r = '0x' + sig.substring(2).substring(0, 64);
      const s = '0x' + sig.substring(2).substring(64, 128);
      const v = '0x' + sig.substring(2).substring(128, 130);

      console.log('delegatee', _delegatee);
      console.log('nonce', _nonce);
      console.log('expiry', _expiry);
      console.log('v', v);
      console.log('r', r);
      console.log('s', s);

      let response;
      try {
        response = await fetch(window.location.origin + '/signature/', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            delegatee: _delegatee,
            nonce: _nonce,
            expiry: _expiry,
            v: v,
            r: r,
            s: s,
          })
        });
      } catch(err) {
        console.error('POST signature error:', err);
      }
    };
  }
});
