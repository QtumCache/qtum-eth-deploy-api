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

    event BatchTransfer(string _pointer);

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
    
    function _transfer(address _from, address _to, uint256 _tokenId) internal {
        if(_from != address(0)){
            balances[_from] -= 1;
        }
        tokenExists[_tokenId] = true;
        tokenOwners[_tokenId] = _to;
        ownerTokens[_to][ownerTokenLength[_to]] = _tokenId;
        ownerTokenLength[_to] += 1;
        balances[_to] += 1;
    }
    
    function tokenOfOwnerByIndex(address _owner, uint256 _index) public view returns (uint tokenId){
        return ownerTokens[_owner][_index];
    }

    function multiTransfer(address[] _from, address[] _to, uint256[] _tokenId, string _pointer) public {
        require(msg.sender == owner);
        require(_from.length == _to.length);
        require(_from.length == _tokenId.length);
        for(uint256 i = 0; i<_from.length; i++) {
            _transfer(_from[i], _to[i], _tokenId[i]);
        }
        emit BatchTransfer(_pointer);
    }
    
}
