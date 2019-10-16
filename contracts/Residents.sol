pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


/**
  @dev Government can add residents. But residents can modify their details.
 */
contract Residents is Ownable {
  using SafeMath for uint256;

  struct Resident {
    address addr;
    string fullName;
    string email;
    string password;
  }

  mapping(address => Resident) public residents;
  uint256 public residentAmount;


  /**
    @dev Adds resident object.
    @param _address  Resident Ethereum address.
   */
  function addResident(address _address) public onlyOwner {
    require(residents[_address].addr != _address, "Resident exists");
    residents[_address] = Resident({addr: _address, fullName: "", email: "", password: ""});
    residentAmount = residentAmount.add(1);
  }

  /**
    @dev Updates resident object.
    @param _fullName  Resident full name.
    @param _email  Resident email.
    @param _password  Resident password.
   */
  function updateResident(string memory _fullName, string memory _email, string memory _password) public {
    require(residents[msg.sender].addr == msg.sender, "Wrong resident");

    residents[msg.sender].fullName = _fullName;
    residents[msg.sender].email = _email;
    residents[msg.sender].password = _password;
  }
}
