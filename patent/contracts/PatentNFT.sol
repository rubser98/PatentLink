// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


interface IPatentToken{
    function transfer(address from, address to, uint amount) external returns (bool);
    function balanceOf(address account) external view returns(uint);
    function payFilingFee(address sender) external returns(bool);
}


/// @title PatentNFT contract
/// @author Carolina Proietti, Edoardo Giuggioloni, Paolo Marchignoli, Ruben Seror 
/// @notice You can use this contract to file patent, buy and sell associated NFTs
contract PatentNFT is ERC721URIStorage{

    // Struttura dei brevetti
    struct Patent {
        string name; //brevetto in vendita (s/n)
        uint timestamp;//data deposito brevetto
        uint deadline;//scadenza brevetto
    }

    enum State {Refused, Accepted, Pending}

    struct Bid{
        address bidder;
        uint amount;
        State state;
    }

    IPatentToken private token;
    uint private patentCounter;
    mapping(uint => Patent) private patents;
    mapping(uint => Bid[]) private bids;

    //evento deposito
    event PatentFiled(uint indexed patentId, address owner);
    //evento cessione
    event PatentAssignment(uint indexed patentId, address from, address to);
    //evento offerta rifiutata
    event BidRefused(uint tokenId, address owner, address bidder);
    //evento offerta
    event MakeBid(uint tokenId, address owner, address bidder);

    constructor(address tokenAddress) ERC721("PatentNFT","PTNFT"){
        token = IPatentToken(tokenAddress);
        patentCounter = 0;
    }

    ///@notice method that allow user to file their patents
    ///@param _uri URI of the filed Patent in IPFS
    function filePatent(string memory _uri, string memory _name) public{
        require(bytes(_uri).length > 0,'URI is not defined');
        require(token.payFilingFee(msg.sender),'Filing fee payment failed');

        patents[patentCounter] = Patent({ 
            name: _name, 
            timestamp: block.timestamp,
            deadline: block.timestamp + (20 * 365 days)});
        _safeMint(msg.sender, patentCounter);
        _setTokenURI(patentCounter, _uri);
        emit PatentFiled(patentCounter, msg.sender);
        patentCounter++;
    }


    ///@notice return number of filed patents
    function getTokenCount() public view returns(uint){
        return patentCounter;
    }

    ///@notice get bids of a particular patent nft
    ///@param tokenId nft id
    function getBids(uint tokenId) public view returns(Bid[] memory){
        //require(ownerOf(tokenId) == msg.sender,'You are not the owner of the patent');
        return bids[tokenId];
    }

    ///@notice reject the indicated bid for specific NFT
    ///@param tokenId NFT id @param indexBid index of the token's bids list
    function rejectBid(uint tokenId, uint indexBid) public{
        require(ownerOf(tokenId) == msg.sender,'You are not the owner of the patent');
        require(bids[tokenId].length > indexBid, 'Index out of range');
        bids[tokenId][indexBid].state = State.Refused;
        emit BidRefused(tokenId, ownerOf(tokenId), bids[tokenId][indexBid].bidder);
    }

    ///@notice accept the indicated bid for specific NFT
    ///@param tokenId NFT id @param indexBid index of the token's bids list
    function acceptBid(uint tokenId, uint indexBid) public{
        require(ownerOf(tokenId) == msg.sender,'You are not the owner of the patent');
        require(bids[tokenId].length > indexBid, 'Index out of range');
        Bid memory bid = bids[tokenId][indexBid];
        require(bid.state == State.Pending);
        require(ownerOf(tokenId) != bid.bidder, 'You can not accept your bids');
        require(token.balanceOf(bid.bidder) >= bid.amount, 'The bidder does not have enough PTNT');
        emit PatentAssignment(tokenId, msg.sender, bid.bidder);
        token.transfer(bid.bidder, msg.sender, bid.amount);
        safeTransferFrom(msg.sender, bid.bidder, tokenId);
        clearBids(tokenId);
    }

    ///@notice make a bid for a specific NFT
    ///@param patentId NFT id @param amount amount in PNT of the bid
    function makeBid(uint patentId, uint amount) public{
        require(ownerOf(patentId) != address(0), 'The patent does not exist');
        require(msg.sender != ownerOf(patentId),'You are already the owner of the patent');
        require(token.balanceOf(msg.sender) >= amount, 'You do not have enough PTNT');
        
        Bid memory bid = Bid({
            bidder: msg.sender,
            amount: amount,
            state: State.Pending
        });
        bids[patentId].push(bid);
        emit MakeBid(patentId, ownerOf(patentId), msg.sender);
    }

    ///@notice clear bid list of a specific NFT
    ///@param patentId NFT id
    function clearBids(uint patentId) internal {
        while(bids[patentId].length > 0){
            bids[patentId].pop();
        }
    }

    ///@notice get indicated patent
    ///@param patentId NFT id
    function getPatent(uint patentId) public view returns(Patent memory){
        return patents[patentId];

    }

    ///@notice get the list of NFT id for a specific user
    ///@param owner address of the user
    function getPatentsByOwner(address owner) external view returns (uint[] memory) {
        uint tokenCount = balanceOf(owner);
        uint[] memory tokens = new uint[](tokenCount);
        uint count = 0;
        for(uint i = 0; i < patentCounter && count < tokenCount; i++) {
            if (ownerOf(i) == owner) {
                tokens[count] = i;
                count++;
            }
            
        }

        return tokens;
    }
    



}