function Biometric() {}

Biometric.prototype.isAvailable = function (successCallback, errorCallback) {
  cordova.exec(successCallback, errorCallback, "Biometric", "isAvailable", []);
};

Biometric.prototype.biometricType = function (successCallback, errorCallback) {
  cordova.exec(successCallback, errorCallback, "Biometric", "biometricType", []);
};

Biometric.prototype.didBiometricDatabaseChange = function (successCallback, errorCallback) {
  cordova.exec(successCallback, errorCallback, "Biometric", "didBiometricDatabaseChange", []);
};

Biometric.prototype.verifyBiometric = function (message, successCallback, errorCallback) {
  cordova.exec(successCallback, errorCallback, "Biometric", "verifyBiometric", [message]);
};

Biometric.prototype.verifyBiometricWithCustomPasswordFallback = function (message, successCallback, errorCallback) {
  cordova.exec(successCallback, errorCallback, "Biometric", "verifyBiometricWithCustomPasswordFallback", [message]);
};

Biometric.prototype.verifyBiometricWithCustomPasswordFallbackAndEnterPasswordLabel = function (message, enterPasswordLabel, successCallback, errorCallback) {
  cordova.exec(successCallback, errorCallback, "Biometric", "verifyBiometricWithCustomPasswordFallbackAndEnterPasswordLabel", [message, enterPasswordLabel]);
};

Biometric.install = function () {
  if (!window.plugins) {
    window.plugins = {};
  }
  window.plugins.biometric = new Biometric();
  return window.plugins.Biometric;
};

cordova.addConstructor(Biometric.install);