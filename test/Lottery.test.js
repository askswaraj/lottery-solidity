const assert= require('assert'); //assert some test (==)
const ganache=require('ganache-cli'); // Local test network
const {interface,bytecode}=require('../compile')
const Web3=require('web3');  // Contructor function
const web3=new Web3(ganache.provider()); // create an instance of web3 and telling it to connect to ganache local test network
let accounts;
let lottery;
beforeEach(async ()=>{
    //get list of all unlocked accounts
    accounts=await web3.eth.getAccounts()
    // use one of the account to deploy our network
    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data:bytecode})
    .send({from: accounts[0], gas: '1000000'})
})
describe('lottery contract',()=>{
    it('deployed',()=>{
        assert.ok(lottery.options.address);
    });
    it('allows one account to enter into lottery',async ()=>{
        await lottery.methods.enter().send({from:accounts[0],value:web3.utils.toWei('0.02','ether')});

        const players=await lottery.methods.getPlayers().call({from:accounts[0]});

        assert.equal(accounts[0],players[0]);
        assert.equal(1,players.length);
    });
    it('allows multiple accounts to enter into lottery',async ()=>{
        await lottery.methods.enter().send({from:accounts[0],value:web3.utils.toWei('0.02','ether')});
        await lottery.methods.enter().send({from:accounts[1],value:web3.utils.toWei('0.02','ether')});
        await lottery.methods.enter().send({from:accounts[2],value:web3.utils.toWei('0.02','ether')});

        const players=await lottery.methods.getPlayers().call({from:accounts[0]});

        assert.equal(accounts[0],players[0]);
        assert.equal(accounts[1],players[1]);
        assert.equal(accounts[2],players[2]);
        assert.equal(3,players.length);
    });
    it('requires a minimum amount of ether to enter into lottery',async ()=>{
        try
        {
            await lottery.methods.enter().send({
                from:accounts[0],
                value: 1000
            });
            assert(false);
        }
        catch(err)
        {
            assert(err);
        }
    });
    it('only manager can call pickWinner',async ()=>{
        try
        {
            await lottery.methods.pickWinner().call({from:accounts[1]})
            assert(false);
        }
        catch(err)
        {
            assert(err);
        }
    });
    it('sends the entire amount to winner and resets the player array',async ()=>{
        await lottery.methods.enter().send({from:accounts[0],value:web3.utils.toWei('2','ether')});
        const initialBalance=await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({from:accounts[0]});
        const finalBalance= await web3.eth.getBalance(accounts[0]);
        const difference =finalBalance- initialBalance;
        console.log(difference);
        assert(difference>web3.utils.toWei('1.8','ether'));
    })
})