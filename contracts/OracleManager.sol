pragma solidity ^0.8.0;

contract OracleManager {
    // Mapping to track registered providers
    mapping(address => bool) public isProviderRegistered;

    // Event emitted when a provider is registered
    event ProviderRegistered(address indexed provider);

    // Mapping to store the staked amount for each provider
    mapping(address => uint256) public stakes;

    // Minimum stake amount (0.1 Ether)
    uint256 public constant MIN_STAKE = 0.1 ether;

    // Event emitted when a provider stakes
    event ProviderStaked(address indexed provider, uint256 amount);

    /**
     * @dev Registers the caller as an ML provider.
     */
    function registerProvider() public {
        require(!isProviderRegistered[msg.sender], "Provider already registered");
        isProviderRegistered[msg.sender] = true;
        emit ProviderRegistered(msg.sender);
    }

    /**
     * @dev Allows a registered provider to stake Ether.
     */
    function stake() public payable {
        require(isProviderRegistered[msg.sender], "Provider not registered");
        require(msg.value >= MIN_STAKE, "Minimum stake amount not met");

        stakes[msg.sender] += msg.value;
        emit ProviderStaked(msg.sender, msg.value);
    }

    /**
     * @dev Returns the staked amount for a given provider.
     * @param provider The address of the provider.
     * @return The staked amount.
     */
    function getProviderStake(address provider) public view returns (uint256) {
        return stakes[provider];
    }
}
