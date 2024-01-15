// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


interface IERC20{
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
        bool forSale; //brevetto in vendita (s/n)
        uint price; //prezzo brevetto (0 se non è in vendita)
        uint timestamp;//data deposito brevetto
        uint deadline;//scadenza brevetto
    }

    enum State {Refused, Accepted, Pending}

    struct Bid{
        address bidder;
        uint amount;
        State state;
    }

    IERC20 public token;
    uint private patentCounter;
    mapping(uint => Patent) public patents;
    uint filingPrice;
    mapping(uint => Bid[]) bids;

    //evento deposito
    event PatentFiled(uint indexed patentId, address owner);
    //evento cessione
    event PatentAssignment(uint indexed patentId, address from, address to);
    //evento offerta rifiutata
    event BidRefused(uint tokenId, address owner, address bidder);
    //evento offerta
    event MakeBid(uint tokenId, address owner, address bidder);

    constructor(address tokenAddress) ERC721("PatentNFT","PTNFT"){
        token = IERC20(tokenAddress);
        patentCounter = 0;
    }

    ///@notice method that allow user to file their patents
    ///@param _uri URI of the filed Patent in IPFS
    function filePatent(string memory _uri) public{
        require(token.payFilingFee(msg.sender),'Filing fee payment failed');
        patents[patentCounter] = Patent({ 
            forSale: false, 
            price:0,
            timestamp: block.timestamp,
            deadline: block.timestamp + (20 * 365 days)});
        _safeMint(msg.sender, patentCounter);
        _setTokenURI(patentCounter, _uri);
        emit PatentFiled(patentCounter, msg.sender);
        patentCounter++;
    }
    ///@notice user can put the patent up for sale
    ///@param patentId nft id of the patent
    function setPatentForSale(uint patentId, uint price) public {
        require(ownerOf(patentId) == msg.sender,'You are not the owner of the patent');
        require(block.timestamp < patents[patentId].deadline,'The patent has expired');
        require(patents[patentId].forSale, 'Patent already up for sale');
        patents[patentId].price = price;
        patents[patentId].forSale = true;
    }

    ///@notice user can remove the patent from sale
    ///@param patentId nft id of the patent
    function setPatentNotForSale(uint patentId) public {
        require(ownerOf(patentId) == msg.sender,'You are not the owner of the patent');
        require(block.timestamp < patents[patentId].deadline,'The patent has expired');
        require(patents[patentId].forSale == false, 'Patent already not up for sale');
        patents[patentId].price = 0;
        patents[patentId].forSale = false;    
    }

    function buyPatent(uint patentId) public {
        require(ownerOf(patentId) != address(0),'The patent does not exist');
        require(patents[patentId].forSale,'The patent is not in sale');
        require(block.timestamp < patents[patentId].deadline,'The patent has expired');
        require(token.transfer(msg.sender,ownerOf(patentId), patents[patentId].price),'You have not enough PTNT to buy the patent');
        emit PatentAssignment(patentId, ownerOf(patentId), msg.sender);
        _transfer(ownerOf(patentId), msg.sender, patentId);
    }
    
    ///@notice return number of filed patents
    function getTokenCount() public view returns(uint){
        return patentCounter;
    }

    ///@notice return the price in PTNT of a specific patent
    ///@param patentId id of the nft associated to the patent
    function getPatentprice(uint patentId) public view returns(uint){
        return patents[patentId].price;
    }

    function getBids(uint tokenId) public view returns(Bid[] memory){
        require(ownerOf(tokenId) == msg.sender,'You are not the owner of the patent');
        return bids[tokenId];
    }

    function rejectBid(uint tokenId, uint indexBid) public{
        require(ownerOf(tokenId) == msg.sender,'You are not the owner of the patent');
        require(bids[tokenId].length < indexBid, 'Index out of range');
        bids[tokenId][indexBid].state = State.Refused;
        emit BidRefused(tokenId, ownerOf(tokenId), bids[tokenId][indexBid].bidder);
    }

    function acceptBid(uint tokenId, uint indexBid) public{
        require(ownerOf(tokenId) == msg.sender,'You are not the owner of the patent');
        require(bids[tokenId].length < indexBid, 'Index out of range');
        Bid memory bid = bids[tokenId][indexBid];
        require(ownerOf(tokenId) != bid.bidder, 'You can not accept your bids');
        require(token.balanceOf(bid.bidder) >= bid.amount, 'The bidder does not have enough PTNT');
        emit PatentAssignment(tokenId, msg.sender, bid.bidder);
        token.transfer(bid.bidder, msg.sender, bid.amount);
        safeTransferFrom(msg.sender, bid.bidder, tokenId);
        clearBids(tokenId);
    }

    function makeBid(uint patentId, uint amount) public{
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

    function clearBids(uint patentId) internal {
        while(bids[patentId].length > 0){
            bids[patentId].pop();
        }
    }


}