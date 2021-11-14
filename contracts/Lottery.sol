pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;
    
    function Lottery() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value > .01 ether); // USER MUST PAY 0.1 ETHER TO ENTER
        players.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players));    // same as sha256 , now is current time
    }
    
    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(this.balance);
        players = new address[](0);    //creating an array of size 0
    }
    
    modifier restricted() {
        require(msg.sender == manager);    //manager should tell the contract to pick winner
        _;
    }
    
    function getPlayers() public view returns (address[]) {
        return players;
    }
}   