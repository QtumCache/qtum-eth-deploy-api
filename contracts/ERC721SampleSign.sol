pragma solidity ^0.4.24;

contract ERC721Sample {
    address owner;
    string public name = "Sample ERC721";
    string public symbol = "NFT";
    uint256 public totalSupply = 0;
    
    mapping(address => uint) private balances;
    mapping(uint256 => address) private tokenOwners;
    mapping(address => mapping(uint256 => uint256)) private ownerTokens;
    mapping(address => uint256) private ownerTokenLength;
    mapping(uint256 => bool) private tokenExists;

    event Transfer(address indexed _from, address indexed _to, uint256 _tokenId, string _signature);

    constructor() public {
        owner = msg.sender;
    }
    
    function balanceOf(address _owner) public view returns (uint balance) {
        return balances[_owner];
    }
    
    function ownerOf(uint256 _tokenId) public view returns (address _owner) {
        require(tokenExists[_tokenId]);
        return tokenOwners[_tokenId];
    }
    
    function removeFromTokenList(address _owner, uint256 _tokenId) internal {
        for(uint256 i = 0; ownerTokens[owner][i] != _tokenId; i++){
            ownerTokens[_owner][i] = 0;
        }
    }
    
    function _transfer(address _from, address _to, uint256 _tokenId, string _signature) internal {
        if(_from != address(0)){
            balances[_from] -= 1;
            removeFromTokenList(_from, _tokenId);
        }
        tokenExists[_tokenId] = true;
        tokenOwners[_tokenId] = _to;
        ownerTokens[_to][ownerTokenLength[_to]] = _tokenId;
        ownerTokenLength[_to] += 1;
        balances[_to] += 1;
        emit Transfer(_from, _to, _tokenId, _signature);
    }
    
    function transfer(address _to, uint256 _tokenId, string _signature) public {
        require(tokenExists[_tokenId]);
        require(msg.sender == ownerOf(_tokenId));
        require(msg.sender != _to);
        require(_to != address(0));
        
        _transfer(msg.sender, _to, _tokenId, _signature);
    }
    
    function tokenOfOwnerByIndex(address _owner, uint256 _index) public view returns (uint tokenId){
        return ownerTokens[_owner][_index];
    }
    
    function mint(address _to, uint256 _tokenId, string _signature) public {
        require(msg.sender == owner);
        require(!tokenExists[_tokenId]);
        require(_to != address(0));
        totalSupply += 1;
        
        _transfer(address(0), _to, _tokenId, _signature);
    }
}
