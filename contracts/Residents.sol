pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


/**
  @dev Government can add residents. But residents can modify their details.
 */
contract Residents is Ownable {
  using SafeMath for uint256;

  struct Resident {
    uint256 id;
    address addr;
    string fullName;
    string email;
    string password;
    uint256[] realtyIds;
  }

  mapping(address => Resident) public residents;
  uint256 public residentAmount;


  /**
    @dev Adds resident object.
    @param _address  Resident Ethereum address.
   */
  function addResident(address _address) public onlyOwner {
    require(residents[_address].addr != _address, "Resident exists");
    
    residents[_address].id = residentAmount;
    residents[_address].addr = _address;
    residentAmount = residentAmount.add(1);
  }

  /**
    @dev Adds realty id to resident object.
    @param _address  Resident Ethereum address.
    @param _realtyId  Realty id.
   */
  function addResidentRealty(address _address, uint256 _realtyId) public onlyOwner {
    require(residents[_address].addr == _address, "No such resident");
    
    residents[_address].realtyIds.push(_realtyId);
  }

  /**
    @dev Updates resident object.
    @param _fullName  Resident full name.
    @param _email  Resident email.
    @param _password  Resident password.
   */
  function updateResidentDetails(string memory _fullName, string memory _email, string memory _password) public {
    require(residents[msg.sender].addr == msg.sender, "Wrong resident");

    residents[msg.sender].fullName = _fullName;
    residents[msg.sender].email = _email;
    residents[msg.sender].password = _password;
  }
  
  /**
    @dev Returns resident realty ids.
    @param _address  Resident Ethereum address.
    @return Realty ids.
   */
  function realtyIdsForResident(address _address) public view returns (uint256[] memory) {
    return residents[_address].realtyIds;
  }

  /**
    @dev Returns resident id.
    @param _address  Resident Ethereum address.
    @return Resident id.
   */
  function residentId(address _address) public view returns(uint256) {
    require(residents[_address].addr == _address, "Wrong resident address");

    return residents[_address].id;
  }
}
