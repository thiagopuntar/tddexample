module.exports = class BrokerError extends Error {
  constructor(brokerMessage) {
    super(`Error at broker: ${brokerMessage}`);
  }
};
