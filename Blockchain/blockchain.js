
const WEB3 = require('web3');
var encryption = require("./encryption");


const CourseContract = require('./Course.json');
const { log } = require('debug');

console.log("Blockchain Module Attached");

//https://www.dappuniversity.com/articles/web3-js-intro

const web3 = new WEB3('http://127.0.0.1:7545/');

async function MakeInstance() 
{
    const id = await web3.eth.net.getId();
    const deployedNetwork = CourseContract.networks[id];

    const contract = new web3.eth.Contract(
        CourseContract.abi,
        deployedNetwork.address
    );
    console.log("Connected to the Blockchain\n");
    
    return contract;
}



module.exports.getHash = async function (_Coursekey, _SectionKey)
{
    
    // console.log("_Coursekey : " + _Coursekey);
    // console.log("_SectionKey : " + _SectionKey);
    

    const contract = await MakeInstance();
    const data = await contract.methods.GetHash(_Coursekey, _SectionKey).call();

    // console.log("blockchain.js hash: ", data);

    return data;
}


module.exports.getMarksRecords = async function (_Coursekey, _SectionKey)
{
    const contract = await MakeInstance();
    const data = await contract.methods.GetMarksRecord(_Coursekey, _SectionKey).call();

    // console.log("blockchain.js Marks Records: ", data);
    if(data != "Record Not Found Against This Key" && data !="Mark's Record Not Found")
        return JSON.parse(data);

    return data;
}






module.exports.setData = async function (_Coursekey, _SectionKey, _hash, _records)
{


    // var records = {  
    //     hash: _hash,
    //     records: _records               
    // };
    // var data = JSON.stringify(records);
    _records = JSON.stringify(_records);

    
    // console.log("_Coursekey : " + _Coursekey);
    // console.log("_SectionKey : " + _SectionKey);
    // console.log("_hash : " + _hash);
    // console.log("_records : " + _records);
    


    // var parsed = JSON.parse(string);

    // console.log("parsed : ",parsed);
    // console.log("parsed.records.marks[1] : " + parsed.records.marks[1]);
   
  

    // console.log("\nStoring string on bc : " + JSON.stringify(data));

    const addresses = await web3.eth.getAccounts();
    // console.log("addresses : ", addresses);

    const contract = await MakeInstance();
    var result = await contract.methods.InsertNewSectionsData(_Coursekey,_SectionKey , _hash, _records).send({
        from: addresses[1]
        ,gas: 6721970
        //gasPrice: 100
    });
    if(result.transactionHash != "")
        return {status:true};
    else
        return {status:false};
}


// #################################################################



module.exports.getGradesHash = async function (_Coursekey, _SectionKey)
{
    
    // console.log("_Coursekey : " + _Coursekey);
    // console.log("_SectionKey : " + _SectionKey);
    

    const contract = await MakeInstance();
    const data = await contract.methods.GetGradesHash(_Coursekey, _SectionKey).call();

    // console.log("blockchain.js hash: ", data);

    return data;
}


module.exports.getGradesRecords = async function (_Coursekey, _SectionKey)
{
    const contract = await MakeInstance();
    const data = await contract.methods.GetGradesRecord(_Coursekey, _SectionKey).call();

    // console.log("blockchain.js Marks Records: ", data);
    if(data != "Record Not Found Against This Key" && data != "Grades Record Not Found")
        return JSON.parse(data);

    return data;
}


module.exports.setGradesData = async function (_Coursekey, _SectionKey, _hash, _records)
{
    // var records = {  
    //     hash: _hash,
    //     records: _records               
    // };
    // var data = JSON.stringify(records);
    _records = JSON.stringify(_records);

    
    // console.log("_Coursekey : " + _Coursekey);
    // console.log("_SectionKey : " + _SectionKey);
    // console.log("_hash : " + _hash);
    // console.log("_records : " + _records);
    


    // var parsed = JSON.parse(string);

    // console.log("parsed : ",parsed);
    // console.log("parsed.records.marks[1] : " + parsed.records.marks[1]);
   
  

    // console.log("\nStoring string on bc : " + JSON.stringify(data));

    const addresses = await web3.eth.getAccounts();
    // console.log("addresses : ", addresses);

    const contract = await MakeInstance();
    var result = await contract.methods.InsertNewSectionsGrades(_Coursekey,_SectionKey , _hash, _records).send({
        from: addresses[1]
        ,gas: 6721970
        //gasPrice: 100
    });
    if(result.transactionHash != "")
        return {status:true};
    else
        return {status:false};
}
