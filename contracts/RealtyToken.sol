pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/access/roles/MinterRole.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./Residents.sol";


/**
  @dev Token to be used for Realty obj representation and trading.
 */
contract RealtyToken is ERC721Full, Ownable, MinterRole {
  struct Realty {
    uint256 governmentId;
    uint256 price;
    string locationAddress;
    string description;
    bool forSale;
  }

  address public ResidentsAddress;
  Realty[] public realtyList;
  mapping(uint256 => uint256) private tokenIdForGovernmentId;  //  govermentId => tokenId

  modifier residentsAddressPresent() {
    require(ResidentsAddress != address(0), "ResidentsAddress not set");
    _;
  }
  
  modifier uniqueGovernmentIdOnly(uint256 _governmentId) {
      if(realtyList.length > 0) {
        uint256 idx = tokenIdForGovernmentId[_governmentId];
        require(idx <= realtyList.length, "Wrong _governmentId"); //  handle index 0
        require(realtyList[idx].governmentId != _governmentId, "_governmentId exists");
      }
      _;
  }


  constructor() ERC721Full("Saudi Arabia Realty", "SARE") public { }

  /**
    @dev Updates ResidentsAddress contract address.
    @param _address ResidentsAddress contract address.
   */
  function updateResidentsAddressContract(address _address) public onlyOwner {
    require(_address != address(0), "Wrong address");

    ResidentsAddress = _address;
  }

  /**
    @dev Creates Realty token with provided info.
    @param _ownerAddress    Resident address.
    @param _governmentId    Realty id in Government documentation.
    @param _price           Realty price.
    @param _locationAddress Realty location address.
    @param _description     Realty description.
  */
  function createRealtyToken(address _ownerAddress, uint256 _governmentId, uint256 _price, string memory _locationAddress, string memory _description) public onlyOwner residentsAddressPresent uniqueGovernmentIdOnly(_governmentId) {
    require(_ownerAddress != address(0), "Wrong _ownerAddress");

    tokenIdForGovernmentId[_governmentId] = totalSupply();
    Residents(ResidentsAddress).addResidentRealty(_ownerAddress, totalSupply());
    _mint(_ownerAddress, totalSupply());

    realtyList.push(Realty({governmentId: _governmentId, price: _price, locationAddress: _locationAddress, description: _description, forSale: false}));
  }

  /**
    @dev updates Realty token info: price, locationAddress, description.
    @param _id              Realty id.
    @param _price           Realty price.
    @param _locationAddress Realty location address.
    @param _description     Realty description.
   */
  function updateRealtyTokenInfo(uint256 _id, uint256 _price, string memory _locationAddress, string memory _description) public residentsAddressPresent {
    require(ownerOf(_id) == msg.sender, "Not owner");

    if(_price > 0) {
      realtyList[_id].price = _price;
    }

    if(bytes(_locationAddress).length > 0) {
      realtyList[_id].locationAddress = _locationAddress;
    }

    if(bytes(_description).length > 0) {
      realtyList[_id].description = _description;
    }
  }

  /**
    @dev Updates Realty token selling status.
    @param _id              Realty id.
    @param _forSale         Realty is selling.
   */
  function updateRealtyTokenSell(uint256 _id, bool _forSale) public residentsAddressPresent {
    require(ownerOf(_id) == msg.sender, "Not owner");
    require(realtyList[_id].forSale != _forSale, "Status is the same");

    realtyList[_id].forSale = _forSale;
  }

  /**
    @dev Returns Realty token info for Realty token id.
    @param _id              Realty token id.
    @return                 governmentId    Realty id in Government documentation.
    @return                 price           Realty price.
    @return                 locationAddress Realty location address.
    @return                 description     Realty description.
    @return                 forSale         Is currently selling.
  */
  function realtyTokenInfo(uint256 _id) public view residentsAddressPresent returns (
    uint256 governmentId,
    uint256 price,
    string memory locationAddress,
    string memory description,
    bool forSale) {
      require(_exists(_id), "Token does not exist");

      governmentId = realtyList[_id].governmentId;
      price = realtyList[_id].price;
      locationAddress = realtyList[_id].locationAddress;
      description = realtyList[_id].description;
      forSale = realtyList[_id].forSale;
  }

  /**
    @dev Returns Realty token info realty object id on Government documentation.
    @param _governmentId    Realty id in Government documentation.
    @return                 governmentId    Realty id in Government documentation.
    @return                 price           Realty price.
    @return                 locationAddress Realty location address.
    @return                 description     Realty description.
    @return                 forSale         Is currently selling.
  */
  function realtyTokenInfoWithGovernmentId(uint256 _governmentId) public view residentsAddressPresent returns (
    uint256 governmentId,
    uint256 price,
    string memory locationAddress,
    string memory description,
    bool forSale) {
      require(_governmentIdExists(_governmentId), "GovernmentId does not exist");
      return realtyTokenInfo(tokenIdForGovernmentId[_governmentId]);
  }
  
  function getTokenIdForGovernmentId(uint256 _governmentId) public view returns(uint256) {
      require(_governmentIdExists(_governmentId), "GovernmentId does not exist");
      return tokenIdForGovernmentId[_governmentId];
  }
  
  function _governmentIdExists(uint256 _governmentId) private view returns (bool) {
      return realtyList[tokenIdForGovernmentId[_governmentId]].governmentId == _governmentId;
  }
  
}
