#import <Cordova/CDVPlugin.h>

@interface Biometric :CDVPlugin

- (void)isAvailable:(CDVInvokedUrlCommand*)command;
- (void)biometricType:(CDVInvokedUrlCommand*)command;
- (void)didBiometricDatabaseChange:(CDVInvokedUrlCommand*)command;
- (void)verifyBiometric:(CDVInvokedUrlCommand*)command;
- (void)verifyBiometricWithCustomPasswordFallback:(CDVInvokedUrlCommand*)command;
- (void)verifyBiometricWithCustomPasswordFallbackAndEnterPasswordLabel:(CDVInvokedUrlCommand*)command;

@end
