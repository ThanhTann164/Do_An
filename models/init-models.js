var DataTypes = require("sequelize").DataTypes;
var _auditlogs = require("./auditlogs");
var _biometricdata = require("./biometricdata");
var _comments = require("./comments");
var _contracts = require("./contracts");
var _contractsignatures = require("./contractsignatures");
var _digitalcertificates = require("./digitalcertificates");
var _houseimages = require("./houseimages");
var _houses = require("./houses");
var _houseviewings = require("./houseviewings");
var _iotcontrollogs = require("./iotcontrollogs");
var _iotdevices = require("./iotdevices");
var _iotresponselogs = require("./iotresponselogs");
var _ownershipdocuments = require("./ownershipdocuments");
var _ratings = require("./ratings");
var _transactions = require("./transactions");
var _users = require("./users");
var _userverifications = require("./userverifications");

function initModels(sequelize) {
  var auditlogs = _auditlogs(sequelize, DataTypes);
  var biometricdata = _biometricdata(sequelize, DataTypes);
  var comments = _comments(sequelize, DataTypes);
  var contracts = _contracts(sequelize, DataTypes);
  var contractsignatures = _contractsignatures(sequelize, DataTypes);
  var digitalcertificates = _digitalcertificates(sequelize, DataTypes);
  var houseimages = _houseimages(sequelize, DataTypes);
  var houses = _houses(sequelize, DataTypes);
  var houseviewings = _houseviewings(sequelize, DataTypes);
  var iotcontrollogs = _iotcontrollogs(sequelize, DataTypes);
  var iotdevices = _iotdevices(sequelize, DataTypes);
  var iotresponselogs = _iotresponselogs(sequelize, DataTypes);
  var ownershipdocuments = _ownershipdocuments(sequelize, DataTypes);
  var ratings = _ratings(sequelize, DataTypes);
  var transactions = _transactions(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var userverifications = _userverifications(sequelize, DataTypes);

  comments.belongsTo(comments, { as: "ParentComment", foreignKey: "ParentCommentID"});
  comments.hasMany(comments, { as: "comments", foreignKey: "ParentCommentID"});
  contractsignatures.belongsTo(contracts, { as: "Contract", foreignKey: "ContractID"});
  contracts.hasMany(contractsignatures, { as: "contractsignatures", foreignKey: "ContractID"});
  contractsignatures.belongsTo(digitalcertificates, { as: "Certificate", foreignKey: "CertificateID"});
  digitalcertificates.hasMany(contractsignatures, { as: "contractsignatures", foreignKey: "CertificateID"});
  comments.belongsTo(houses, { as: "House", foreignKey: "HouseID"});
  houses.hasMany(comments, { as: "comments", foreignKey: "HouseID"});
  houseimages.belongsTo(houses, { as: "House", foreignKey: "HouseID"});
  houses.hasMany(houseimages, { as: "houseimages", foreignKey: "HouseID"});
  houseviewings.belongsTo(houses, { as: "House", foreignKey: "HouseID"});
  houses.hasMany(houseviewings, { as: "houseviewings", foreignKey: "HouseID"});
  iotdevices.belongsTo(houses, { as: "House", foreignKey: "HouseID"});
  houses.hasMany(iotdevices, { as: "iotdevices", foreignKey: "HouseID"});
  ownershipdocuments.belongsTo(houses, { as: "House", foreignKey: "HouseID"});
  houses.hasMany(ownershipdocuments, { as: "ownershipdocuments", foreignKey: "HouseID"});
  ratings.belongsTo(houses, { as: "House", foreignKey: "HouseID"});
  houses.hasMany(ratings, { as: "ratings", foreignKey: "HouseID"});
  transactions.belongsTo(houses, { as: "House", foreignKey: "HouseID"});
  houses.hasMany(transactions, { as: "transactions", foreignKey: "HouseID"});
  iotresponselogs.belongsTo(iotcontrollogs, { as: "ControlLog", foreignKey: "ControlLogID"});
  iotcontrollogs.hasMany(iotresponselogs, { as: "iotresponselogs", foreignKey: "ControlLogID"});
  iotcontrollogs.belongsTo(iotdevices, { as: "Device", foreignKey: "DeviceID"});
  iotdevices.hasMany(iotcontrollogs, { as: "iotcontrollogs", foreignKey: "DeviceID"});
  iotresponselogs.belongsTo(iotdevices, { as: "Device", foreignKey: "DeviceID"});
  iotdevices.hasMany(iotresponselogs, { as: "iotresponselogs", foreignKey: "DeviceID"});
  contracts.belongsTo(transactions, { as: "Transaction", foreignKey: "TransactionID"});
  transactions.hasMany(contracts, { as: "contracts", foreignKey: "TransactionID"});
  auditlogs.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(auditlogs, { as: "auditlogs", foreignKey: "UserID"});
  biometricdata.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(biometricdata, { as: "biometricdata", foreignKey: "UserID"});
  comments.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(comments, { as: "comments", foreignKey: "UserID"});
  contractsignatures.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(contractsignatures, { as: "contractsignatures", foreignKey: "UserID"});
  digitalcertificates.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(digitalcertificates, { as: "digitalcertificates", foreignKey: "UserID"});
  houses.belongsTo(users, { as: "Owner", foreignKey: "OwnerID"});
  users.hasMany(houses, { as: "houses", foreignKey: "OwnerID"});
  houseviewings.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(houseviewings, { as: "houseviewings", foreignKey: "UserID"});
  iotcontrollogs.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(iotcontrollogs, { as: "iotcontrollogs", foreignKey: "UserID"});
  ratings.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(ratings, { as: "ratings", foreignKey: "UserID"});
  transactions.belongsTo(users, { as: "Buyer", foreignKey: "BuyerID"});
  users.hasMany(transactions, { as: "transactions", foreignKey: "BuyerID"});
  userverifications.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(userverifications, { as: "userverifications", foreignKey: "UserID"});

  return {
    auditlogs,
    biometricdata,
    comments,
    contracts,
    contractsignatures,
    digitalcertificates,
    houseimages,
    houses,
    houseviewings,
    iotcontrollogs,
    iotdevices,
    iotresponselogs,
    ownershipdocuments,
    ratings,
    transactions,
    users,
    userverifications,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
