var SmartPlug = function() {};

var smartPlugs = {};
module.exports.get = function (ip_address) {
  if (!smartPlugs[ip_address]) {
    smartPlugs[ip_address] = new SmartPlug(ip_address);
  }
  return smartPlugs[ip_address];
};
