// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

error Lottery__NotEnoughMinEth();
error Lottery__NotOpenState();
error Lottery__UpkeepNotNeed(
    uint256 currentBalance,
    uint256 players,
    uint16 state
);

contract Lottery is
    VRFConsumerBaseV2,
    ConfirmedOwner,
    AutomationCompatibleInterface
{
    uint256 private immutable i_minEth;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subId;
    uint16 private constant MIN_REQUEST_CONFIRMATIONS = 6;
    uint16 private constant NUM_WORDS = 1;
    uint32 private immutable i_callbackGasLimit;
    uint256 private immutable i_interval;
    uint256 private lastTimestamp;

    address private s_lastWinner;

    LotteryState private s_state;

    enum LotteryState {
        OPEN,
        CALCULATING
    }

    event LotteryJoin(address indexed sender);
    event LotteryCheckUpkeep(bool indexed need);
    event LotteryWinner(address indexed winner);
    event LotteryRequestRandomNums(uint256 indexed requestId);

    constructor(
        address _vrfCoordinator,
        uint256 _minEth,
        bytes32 _gasLane,
        uint64 _subId,
        uint32 _callbackGasLimit,
        uint256 _interval
    ) VRFConsumerBaseV2(_vrfCoordinator) ConfirmedOwner(msg.sender) {
        i_minEth = _minEth;
        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        i_gasLane = _gasLane;
        i_subId = _subId;
        i_callbackGasLimit = _callbackGasLimit;
        s_state = LotteryState.OPEN;
        i_interval = _interval;
        lastTimestamp = block.timestamp;
    }

    function join() public payable {
        if (msg.value < i_minEth) {
            revert Lottery__NotEnoughMinEth();
        }
        if (s_state != LotteryState.OPEN) {
            revert Lottery__NotOpenState();
        }
        s_players.push(payable(msg.sender));
        emit LotteryJoin(msg.sender);
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool needed, bytes memory /* performData */)
    {
        needed = upkeepNeeded();
        return (needed, "");
    }

    function upkeepNeeded() private view returns (bool) {
        return
            (block.timestamp - lastTimestamp) > i_interval &&
            s_players.length > 0 &&
            s_state == LotteryState.OPEN &&
            address(this).balance > 0;
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        bool need = upkeepNeeded();
        if (!need) {
            revert Lottery__UpkeepNotNeed(
                address(this).balance,
                s_players.length,
                uint16(s_state)
            );
        }

        s_state = LotteryState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subId,
            MIN_REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit LotteryRequestRandomNums(requestId);
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        address payable winner = s_players[randomWords[0] % s_players.length];
        (bool success, ) = winner.call{value: address(this).balance}("");
        require(success, "winner withdraw failed");
        s_lastWinner = winner;
        s_state = LotteryState.OPEN;
        delete s_players;
        lastTimestamp = block.timestamp;
        emit LotteryWinner(winner);
    }

    function getMinEth() public view returns (uint256) {
        return i_minEth;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getState() public view returns (LotteryState) {
        return s_state;
    }

    function getVrfCoordinator()
        public
        view
        returns (VRFCoordinatorV2Interface)
    {
        return i_vrfCoordinator;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getLastWinner() public view returns (address) {
        return s_lastWinner;
    }

    function getLastTimestamp() public view returns (uint256) {
        return lastTimestamp;
    }
}
