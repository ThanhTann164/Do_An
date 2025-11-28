var DataTypes = require("sequelize").DataTypes;
var _appointments = require("./appointments");
var _auditlogs = require("./auditlogs");
var _biometricdata = require("./biometricdata");
var _comments = require("./comments");
var _commissions = require("./commissions");
var _contracts = require("./contracts");
var _contractsignatures = require("./contractsignatures");
var _conversations = require("./conversations");
var _digitalcertificates = require("./digitalcertificates");
var _forumtopics = require("./forumtopics");
var _houseimages = require("./houseimages");
var _houses = require("./houses");
var _houseviewings = require("./houseviewings");
var _iotcontrollogs = require("./iotcontrollogs");
var _iotdevices = require("./iotdevices");
var _iotresponselogs = require("./iotresponselogs");
var _messages = require("./messages");
var _ownershipdocuments = require("./ownershipdocuments");
var _ratings = require("./ratings");
var _requests = require("./requests");
var _transactions = require("./transactions");
var _userdocuments = require("./userdocuments");
var _users = require("./users");
var _withdrawals = require("./withdrawals");
var _packages = require("./packages");
var _userpackages = require("./userpackages");
var _notifications = require("./notifications");
var _payment_transactions = require("./payment_transactions");

function initModels(sequelize) {
  var appointments = _appointments(sequelize, DataTypes);
  var auditlogs = _auditlogs(sequelize, DataTypes);
  var biometricdata = _biometricdata(sequelize, DataTypes);
  var comments = _comments(sequelize, DataTypes);
  var commissions = _commissions(sequelize, DataTypes);
  var contracts = _contracts(sequelize, DataTypes);
  var contractsignatures = _contractsignatures(sequelize, DataTypes);
  var conversations = _conversations(sequelize, DataTypes);
  var digitalcertificates = _digitalcertificates(sequelize, DataTypes);
  var forumtopics = _forumtopics(sequelize, DataTypes);
  var houseimages = _houseimages(sequelize, DataTypes);
  var houses = _houses(sequelize, DataTypes);
  var houseviewings = _houseviewings(sequelize, DataTypes);
  var iotcontrollogs = _iotcontrollogs(sequelize, DataTypes);
  var iotdevices = _iotdevices(sequelize, DataTypes);
  var iotresponselogs = _iotresponselogs(sequelize, DataTypes);
  var messages = _messages(sequelize, DataTypes);
  var ownershipdocuments = _ownershipdocuments(sequelize, DataTypes);
  var ratings = _ratings(sequelize, DataTypes);
  var requests = _requests(sequelize, DataTypes);
  var transactions = _transactions(sequelize, DataTypes);
  var userdocuments = _userdocuments(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var withdrawals = _withdrawals(sequelize, DataTypes);
  var packages = _packages(sequelize, DataTypes);
  var userpackages = _userpackages(sequelize, DataTypes);
  var notifications = _notifications(sequelize, DataTypes);
  var payment_transactions = _payment_transactions(sequelize, DataTypes);

  appointments.belongsTo(users, { as: "Buyer", foreignKey: "BuyerID"});
  users.hasMany(appointments, { as: "buyer_appointments", foreignKey: "BuyerID"});
  appointments.belongsTo(users, { as: "Seller", foreignKey: "SellerID"});
  users.hasMany(appointments, { as: "seller_appointments", foreignKey: "SellerID"});
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
  requests.belongsTo(houses, { as: "House", foreignKey: "HouseID"});
  houses.hasMany(requests, { as: "requests", foreignKey: "HouseID"});
  transactions.belongsTo(houses, { as: "House", foreignKey: "HouseID"});
  houses.hasMany(transactions, { as: "transactions", foreignKey: "HouseID"});
  iotresponselogs.belongsTo(iotcontrollogs, { as: "ControlLog", foreignKey: "ControlLogID"});
  iotcontrollogs.hasMany(iotresponselogs, { as: "iotresponselogs", foreignKey: "ControlLogID"});
  iotcontrollogs.belongsTo(iotdevices, { as: "Device", foreignKey: "DeviceID"});
  iotdevices.hasMany(iotcontrollogs, { as: "iotcontrollogs", foreignKey: "DeviceID"});
  iotresponselogs.belongsTo(iotdevices, { as: "Device", foreignKey: "DeviceID"});
  iotdevices.hasMany(iotresponselogs, { as: "iotresponselogs", foreignKey: "DeviceID"});
  userdocuments.belongsTo(requests, { as: "Request", foreignKey: "RequestID"});
  requests.hasMany(userdocuments, { as: "userdocuments", foreignKey: "RequestID"});
  commissions.belongsTo(transactions, { as: "Transaction", foreignKey: "TransactionID"});
  transactions.hasMany(commissions, { as: "commissions", foreignKey: "TransactionID"});
  contracts.belongsTo(transactions, { as: "Transaction", foreignKey: "TransactionID"});
  transactions.hasMany(contracts, { as: "contracts", foreignKey: "TransactionID"});
  withdrawals.belongsTo(transactions, { as: "Transaction", foreignKey: "TransactionID"});
  transactions.hasMany(withdrawals, { as: "withdrawals", foreignKey: "TransactionID"});
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
  forumtopics.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(forumtopics, { as: "forumtopics", foreignKey: "UserID"});
  houses.belongsTo(users, { as: "Owner", foreignKey: "OwnerID"});
  users.hasMany(houses, { as: "houses", foreignKey: "OwnerID"});
  houseviewings.belongsTo(users, { as: "Staff", foreignKey: "StaffID"});
  users.hasMany(houseviewings, { as: "houseviewings", foreignKey: "StaffID"});
  houseviewings.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(houseviewings, { as: "User_houseviewings", foreignKey: "UserID"});
  iotcontrollogs.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(iotcontrollogs, { as: "iotcontrollogs", foreignKey: "UserID"});
  ratings.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(ratings, { as: "ratings", foreignKey: "UserID"});
  requests.belongsTo(users, { as: "Buyer", foreignKey: "BuyerID"});
  users.hasMany(requests, { as: "requests", foreignKey: "BuyerID"});
  transactions.belongsTo(users, { as: "Staff", foreignKey: "StaffID"});
  users.hasMany(transactions, { as: "transactions", foreignKey: "StaffID"});
  transactions.belongsTo(users, { as: "Buyer", foreignKey: "BuyerID"});
  users.hasMany(transactions, { as: "Buyer_transactions", foreignKey: "BuyerID"});
  userdocuments.belongsTo(users, { as: "User", foreignKey: "UserID"});
  users.hasMany(userdocuments, { as: "userdocuments", foreignKey: "UserID"});
  withdrawals.belongsTo(users, { as: "Seller", foreignKey: "SellerID"});
  users.hasMany(withdrawals, { as: "withdrawals", foreignKey: "SellerID"});
  // Payment transaction relationships
  payment_transactions.belongsTo(users, { as: "User", foreignKey: "user_id"});
  users.hasMany(payment_transactions, { as: "payment_transactions", foreignKey: "user_id"});
  
  // Package relationships
  userpackages.belongsTo(users, { as: "User", foreignKey: "user_id"});
  users.hasMany(userpackages, { as: "userpackages", foreignKey: "user_id"});
  userpackages.belongsTo(packages, { as: "Package", foreignKey: "package_id"});
  packages.hasMany(userpackages, { as: "userpackages", foreignKey: "package_id"});

  // Notification relationships
  notifications.belongsTo(users, { as: "Receiver", foreignKey: "receiverId"});
  users.hasMany(notifications, { as: "notifications", foreignKey: "receiverId"});

  // Conversations relationships
  conversations.belongsTo(users, { as: "Participant1", foreignKey: "Participant1ID"});
  users.hasMany(conversations, { as: "conversations_participant1", foreignKey: "Participant1ID"});
  conversations.belongsTo(users, { as: "Participant2", foreignKey: "Participant2ID"});
  users.hasMany(conversations, { as: "conversations_participant2", foreignKey: "Participant2ID"});

  // Messages relationships
  messages.belongsTo(conversations, { as: "Conversation", foreignKey: "ConversationID"});
  conversations.hasMany(messages, { as: "messages", foreignKey: "ConversationID"});
  messages.belongsTo(users, { as: "Sender", foreignKey: "SenderID"});
  users.hasMany(messages, { as: "messages", foreignKey: "SenderID"});

  return {
    appointments,
    auditlogs,
    biometricdata,
    comments,
    commissions,
    contracts,
    contractsignatures,
    conversations,
    digitalcertificates,
    forumtopics,
    houseimages,
    houses,
    houseviewings,
    iotcontrollogs,
    iotdevices,
    iotresponselogs,
    messages,
    notifications,
    ownershipdocuments,
    packages,
    payment_transactions,
    ratings,
    requests,
    transactions,
    userdocuments,
    userpackages,
    users,
    withdrawals,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
