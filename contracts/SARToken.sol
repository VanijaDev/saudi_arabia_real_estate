pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

/**
  @dev Token to used for realty trading as payment method.
 */
contract sar_token is ERC20, ERC20Detailed("Saudi Arabia RE Token", "SAR", 18) {
  constructor() public {
    _mint(msg.sender, 1000);
  }
}