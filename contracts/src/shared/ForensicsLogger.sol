// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ForensicsLogger is Ownable {
    struct Incident {
        uint256 id;
        uint256 timestamp;
        address target; // user or protocol
        string description;
        bytes32 dataHash;
        uint8 threatLevel;
        IncidentType incidentType;
    }

    enum IncidentType { UserProtection, ProtocolAlert, EmergencyAction }

    Incident[] public incidents;
    mapping(address => uint256[]) public userIncidents;
    mapping(address => uint256[]) public protocolIncidents;

    event IncidentLogged(uint256 indexed id, IncidentType indexed itype, address indexed target);

    constructor() Ownable(msg.sender) {}

    function logUserProtection(address user, string calldata description, bytes32 dataHash) external {
        _logIncident(user, description, dataHash, 0, IncidentType.UserProtection);
    }

    function logProtocolAlert(address protocol, string calldata description, bytes32 dataHash, uint8 threatLevel) external {
        _logIncident(protocol, description, dataHash, threatLevel, IncidentType.ProtocolAlert);
    }

    function logEmergencyAction(address protocol, string calldata description, bytes32 dataHash, uint8 threatLevel) external {
        _logIncident(protocol, description, dataHash, threatLevel, IncidentType.EmergencyAction);
    }

    function _logIncident(
        address target,
        string calldata description,
        bytes32 dataHash,
        uint8 threatLevel,
        IncidentType itype
    ) internal {
        uint256 id = incidents.length;
        incidents.push(Incident({
            id: id,
            timestamp: block.timestamp,
            target: target,
            description: description,
            dataHash: dataHash,
            threatLevel: threatLevel,
            incidentType: itype
        }));

        if (itype == IncidentType.UserProtection) {
            userIncidents[target].push(id);
        } else {
            protocolIncidents[target].push(id);
        }

        emit IncidentLogged(id, itype, target);
    }

    function getIncidentCount() external view returns (uint256) {
        return incidents.length;
    }

    function getUserIncidents(address user) external view returns (uint256[] memory) {
        return userIncidents[user];
    }

    function getProtocolIncidents(address protocol) external view returns (uint256[] memory) {
        return protocolIncidents[protocol];
    }

    function getRecentIncidents(uint256 count) external view returns (Incident[] memory) {
        uint256 total = incidents.length;
        if (count > total) count = total;
        
        Incident[] memory recent = new Incident[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = incidents[total - 1 - i];
        }
        return recent;
    }
}
