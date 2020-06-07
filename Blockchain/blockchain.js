
const WEB3 = require('web3');
var encryption = require("./encryption");


const MyContract = require('./MyContract.json');


//https://www.dappuniversity.com/articles/web3-js-intro

const web3 = new WEB3('http://127.0.0.1:7545/');

async function MakeInstance() 
{
    const id = await web3.eth.net.getId();
    const deployedNetwork = MyContract.networks[id];

    const contract = new web3.eth.Contract(
        MyContract.abi,
        deployedNetwork.address
    );
    console.log("Connected to the Blockchain\n");
    
    return contract;
}

console.log("Blockchain Module Attached");


module.exports.getData = async function (_key)
{
    const contract = await MakeInstance();
    const data = await contract.methods.GetData(_key).call();
   
    return JSON.parse(data);
}


module.exports.setData = async function (_key, _hash, _records)
{
    var records = {  
        hash: _hash,
        records: _records               
    };
    var data = JSON.stringify(records);

    // console.log("string : "+data);
    
    // var parsed = JSON.parse(string);

    // console.log("parsed : ",parsed);
    // console.log("parsed.records.marks[1] : " + parsed.records.marks[1]);
   
  

    // console.log("\nStoring string on bc : " + JSON.stringify(data));

    const addresses = await web3.eth.getAccounts();
    // console.log("addresses : ", addresses);

    const contract = await MakeInstance();
    var result = await contract.methods.SetData(_key, data).send({
        from: addresses[1]
        ,gas: 672197
        //gasPrice: 100
    });
    if(result.transactionHash != "")
        return {status:true};
    else
        return {status:false};
}




