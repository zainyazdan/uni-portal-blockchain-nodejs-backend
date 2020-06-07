var blockchain = require("./Blockchain/blockchain");


// console.log("log before calling getData");



////////////////        getter


blockchain.getData("Fall16:CCN:A:quiz#1").then((result)=>{
    
    console.log("Data aya2 : " , result);
    console.log("hash: " + result.hash);
    console.log("reg_no: ",result.records.reg_no);
    console.log("marks: ",result.records.marks);

    // var data = JSON.parse(result);
    // //console.log("parsed: ",parsed);
    // console.log("hash: " + data.hash);
    // console.log("reg: "+data.records.reg);
    // console.log("marks: "+data.records.marks);

}).catch((err)=>{
    console.log("Error : ", err);
});




// var data = { reg: [ 'L1F16BSCS0157', 'L1F16BSCS0157' ], marks: [ 10, 12 ] };


var data =  {
    transactionHash: '0x9118fad38a86add8d14fe69c431ff4b72f3325cff3d9 c5bf309407041394e422',
    transactionIndex: 0,
    blockHash: '0x5e9ed4f9a8a9d47031d9be724f1b144d0a421a63f7ffa18a4d925bcef41085a3',
    blockNumber: 5,
    from: '0x43772edb853de789679a89c5c201a2b6b573ba06',
    to: '0xfa4a790ec3535740f2be5d4c882d3d5ad0546edd',
    gasUsed: 43855,
    cumulativeGasUsed: 43855,
    contractAddress: null,
    status: true,
    logsBloom: '0x00000000000000000000000000000000000000000000000000   000000000000000000000000000000000000000000000000000000000000000000      000000000000000000000000000000000000000000000000000000000000000000      000000000000000000000000000000000000000000000000000000000000000000      000000000000000000000000000000000000000000000000000000000000000000      ',
    events: {}
  }
;


//////////////        setter

// blockchain.setData("zain2", 
// "043a718774c572bd8a25adbeb1bfcd5c0256ae11cecf9f9c3f925d0e52beaf89", data)
// .then((data)=>{
//     console.log("Status: " , data.status);  
// }).catch((err)=>{
//     console.log("Error 2 : ", err);
// });
    
