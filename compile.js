const solc=require('solc');   //requires package to read file that is not not in javascript
const path=require('path');
const fs=require('fs');
const lotteryPath=path.resolve(__dirname,'contracts','Lottery.sol'); // setting path
const source=fs.readFileSync(lotteryPath,'utf-8')			// reading from file
module.exports=solc.compile(source,1).contracts[':Lottery'];// compiling source code(1 file) and exporting inbox contract;
