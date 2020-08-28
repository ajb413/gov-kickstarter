
const AbiCoder = require("web3-eth-abi");
const Web3 = require("web3");

// TODO: Swap with ether's own implementation of this
// e.g. findTypes("postPrices(bytes[],bytes[],string[])")-> ["bytes[]","bytes[]","string[]"]
function findTypes(functionSig) {
  // this unexported function from ethereumjs-abi is copy pasted from source
  // see https://github.com/ethereumjs/ethereumjs-abi/blob/master/lib/index.js#L81
  let parseSignature = function (sig) {
    var tmp = /^(\w+)\((.*)\)$/.exec(sig) || [];

    if (tmp.length !== 3) {
      throw new Error("Invalid method signature");
    }

    var args = /^(.+)\):\((.+)$/.exec(tmp[2]);

    if (args !== null && args.length === 3) {
      return {
        method: tmp[1],
        args: args[1].split(","),
        retargs: args[2].split(","),
      };
    } else {
      var params = tmp[2].split(",");
      if (params.length === 1 && params[0] === "") {
        // Special-case (possibly naive) fixup for functions that take no arguments.
        // TODO: special cases are always bad, but this makes the function return
        // match what the calling functions expect
        params = [];
      }
      return {
        method: tmp[1],
        args: params,
      };
    }
  };

  return parseSignature(functionSig).args;
}

function encodeFull(sig, args) {
  const types = findTypes(sig);
  const callData =
    AbiCoder.encodeFunctionSignature(sig) +
    AbiCoder.encodeParameters(types, args).slice(2);
  return [types, callData];
}

function encode(sig, args) {
  let [types, callData] = encodeFull(sig, args);
  return callData;
}

async function signAndSend(transaction, signerKey, web3) {
  let signedTransaction =
    await web3.eth.accounts.signTransaction(transaction, signerKey);

  return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction || '');
}

function buildTrxData(nonce, expiry, v, r, s){
  const functionSig = 'delegateToProposalBySig(uint,uint,uint8,bytes32,bytes32)';
  return encode(
    functionSig,
    [nonce, expiry, v, r, s]
  );
}

async function delegate(nonce, expiry, v, r, s) {
  const kickstarterContract = '0x9c3dd2443CC4AD16d367105bBd89Ae8077f2B069';
  const testnetWeb3 = new Web3('https://kovan-eth.compound.finance/');
  const testnetKey = '1194f52e3287193470f1d488baf19dd936c46131b82bb87d5df58d688cb339d3';

  const trxData = buildTrxData(nonce, expiry, v, r, s);
  console.log("build trx data = ", trxData);
  const trx = {
      data: trxData,
      // TODO maybe just add delegatee here
      to: kickstarterContract,
      gasPrice: 312000000000,
      gas: 195000
  };
  let account = testnetWeb3.eth.accounts.privateKeyToAccount(testnetKey)
  console.log(`Posting from account: ${account.address}`);

  // TODO: Why manual nonce management?
  // let nonce = await web3.eth.getTransactionCount(pubKey.address)
  // transaction.nonce = nonce

  try {
    return await signAndSend(trx, testnetKey, testnetWeb3);
  } catch (e) {
    console.debug({transaction});
    console.warn('Failed to delegate by signature');
    console.warn(e);
  }
}

module.exports = {
  delegate
}