#import "Biometric.h"
#import <LocalAuthentication/LocalAuthentication.h>

@interface Biometric()
@property(nonatomic, strong) NSString *keychainItemIdentifier;
@property(nonatomic, strong) NSString *keychainItemServiceName;
@property(nonatomic, strong) NSString *biometricDatabaseStateKey;
@end

@implementation Biometric

- (NSString *)keychainItemIdentifier {
    if (_keychainItemIdentifier == nil) {
        _keychainItemIdentifier = @"BiometricKey";
    }
    return _keychainItemIdentifier;
}

- (NSString *)keychainItemServiceName {
    if (_keychainItemServiceName == nil) {
        NSString *bundleID = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleIdentifier"];
        _keychainItemServiceName = [bundleID stringByAppendingString:@".BiometricPlugin"];
    }	
    return _keychainItemServiceName;
}

- (NSString *)biometricDatabaseStateKey {
    if (_biometricDatabaseStateKey == nil) {
        _biometricDatabaseStateKey = @"BiometricDatabaseStateKey";
    }
    return _biometricDatabaseStateKey;
}

- (void)isAvailable:(CDVInvokedUrlCommand*)command {
  if (NSClassFromString(@"LAContext") == NULL) {
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR] callbackId:command.callbackId];
    return;
  }

  [self.commandDelegate runInBackground:^{
    NSError *error = nil;
    LAContext *laContext = [[LAContext alloc] init];
    if ([laContext canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error]) {
      NSString *biometryType = @"touch";
      if (@available(iOS 11.0, *)) {
        if (laContext.biometryType == LABiometryTypeFaceID) {
          biometryType = @"face";
        }
      }
      [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:biometryType] callbackId:command.callbackId];
    } else {
      NSArray *errorKeys = @[@"code", @"localizedDescription"];
      [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:[error dictionaryWithValuesForKeys:errorKeys]] callbackId:command.callbackId];
    }
  }];
}

- (void)biometricType:(CDVInvokedUrlCommand*)command {
  __block NSString *biometryType = @"none";
  if (NSClassFromString(@"LAContext") == NULL) {
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:biometryType] callbackId:command.callbackId];
    return;
  }
  [self.commandDelegate runInBackground:^{
    NSError *error = nil;
    LAContext *laContext = [[LAContext alloc] init];
    [laContext canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error];
    biometryType = @"touch";
    if (@available(iOS 11.0, *)) {
      if (laContext.biometryType == LABiometryTypeFaceID) {
        biometryType = @"face";
      }
    }
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:biometryType] callbackId:command.callbackId];
  }];
}

- (void)didBiometricDatabaseChange:(CDVInvokedUrlCommand*)command {
  // Get enrollment state
  [self.commandDelegate runInBackground:^{
    LAContext *laContext = [[LAContext alloc] init];
    NSError *error = nil;
    // we expect the dev to have checked 'isAvailable' already so this should not return an error,
    // we do however need to run canEvaluatePolicy here in order to get a non-nil evaluatedPolicyDomainState
    if (![laContext canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error]) {
      [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]] callbackId:command.callbackId];
      return;
    }
    // only supported on iOS9+, so check this.. if not supported just report back as false
    if (![laContext respondsToSelector:@selector(evaluatedPolicyDomainState)]) {
      [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:NO] callbackId:command.callbackId];
      return;
    }
    NSData * state = [laContext evaluatedPolicyDomainState];
    if (state != nil) {
      NSString * stateStr = [state base64EncodedStringWithOptions:0];
      NSString * storedState = [[NSUserDefaults standardUserDefaults] stringForKey:self.biometricDatabaseStateKey];
      // whenever a finger is added/changed/removed the value of the storedState changes,
      // so compare agains a value we previously stored in the context of this app
      BOOL changed = storedState != nil && ![stateStr isEqualToString:storedState];
      [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:changed] callbackId:command.callbackId];
      // Store enrollment
      [[NSUserDefaults standardUserDefaults] setObject:stateStr forKey:self.biometricDatabaseStateKey];
      [[NSUserDefaults standardUserDefaults] synchronize];
    }
  }];
}

// this 'default' method uses keychain instead of localauth so the passcode fallback can be used
- (void)verifyBiometric:(CDVInvokedUrlCommand*)command {
  NSString *message = [command.arguments objectAtIndex:0];
  NSString *callbackId = command.callbackId;
  [self.commandDelegate runInBackground:^{
    if (![self createKeyChainEntry]) {
      NSLog(@"Keychain trouble. Falling back to verifyBiometricWithCustomPasswordFallback.");
      [self verifyBiometricWithCustomPasswordFallback:command];
      return;
    }
    // Create the keychain query attributes using the values from the first part of the code.
    NSMutableDictionary * query = [[NSMutableDictionary alloc] initWithObjectsAndKeys:
                                   (__bridge id)(kSecClassGenericPassword), kSecClass,
                                   self.keychainItemIdentifier, kSecAttrAccount,
                                   self.keychainItemServiceName, kSecAttrService,
                                   message, kSecUseOperationPrompt,
                                   nil];
    // Start the query and the biometric authentication or device passcode validation
    OSStatus userPresenceStatus = SecItemCopyMatching((__bridge CFDictionaryRef)query, NULL);
    // Ignore the found content of the key chain entry (the dummy password) and only evaluate the return code.
    if (noErr == userPresenceStatus) {
      NSLog(@"Biometric or device passcode validated.");
      [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
    } else {
      NSLog(@"Biometric or device passcode could not be validated. Status %d.", (int) userPresenceStatus);
      NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:userPresenceStatus userInfo:nil];
      NSArray *errorKeys = @[@"code", @"localizedDescription"];
      [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:[error dictionaryWithValuesForKeys:errorKeys]] callbackId:callbackId];
      return;
    }
  }];
}

// This implementation uses LocalAuthentication and has no built-in passcode fallback
- (void)verifyBiometricWithCustomPasswordFallback:(CDVInvokedUrlCommand*)command {
  NSString *message = [command.arguments objectAtIndex:0];
  [self verifyBiometricWithCustomPasswordFallback:command.callbackId withMessage:message andEnterPasswordLabel:nil];
}

- (void)verifyBiometricWithCustomPasswordFallbackAndEnterPasswordLabel:(CDVInvokedUrlCommand*)command {
  NSString *message = [command.arguments objectAtIndex:0];
  NSString *enterPasswordLabel = [command.arguments objectAtIndex:1];
  [self verifyBiometricWithCustomPasswordFallback:command.callbackId withMessage:message andEnterPasswordLabel:enterPasswordLabel];
}

- (void)verifyBiometricWithCustomPasswordFallback:(NSString*)callbackId withMessage:(NSString*)message andEnterPasswordLabel:(NSString*)enterPasswordLabel {
  if (NSClassFromString(@"LAContext") == NULL) {
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR] callbackId:callbackId];
    return;
  }
  [self.commandDelegate runInBackground:^{
    NSError *error = nil;
    LAContext *laContext = [[LAContext alloc] init];
    if (![laContext canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error]) {
      [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]] callbackId:callbackId];
      return;
    }
    // this replaces the default 'Enter password' button label
    if (enterPasswordLabel != nil) {
      laContext.localizedFallbackTitle = enterPasswordLabel;
    }
    [laContext evaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics localizedReason:message reply:^(BOOL authOK, NSError *error) {
      if (authOK) {
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:callbackId];
      } else {
        // invoked when the scan failed 3 times in a row, the cancel button was pressed, or the 'enter password' button was pressed
        NSArray *errorKeys = @[@"code", @"localizedDescription"];
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:[error dictionaryWithValuesForKeys:errorKeys]] callbackId:callbackId];
      }
    }];
  }];
}

// Note that this needs to run only once but it can deal with multiple runs
- (BOOL)createKeyChainEntry {
  NSMutableDictionary	* attributes = [[NSMutableDictionary alloc] initWithObjectsAndKeys:
                                      (__bridge id)(kSecClassGenericPassword), kSecClass,
                                      self.keychainItemIdentifier, kSecAttrAccount,
                                      self.keychainItemServiceName, kSecAttrService,
                                      nil];
  CFErrorRef accessControlError = NULL;
  SecAccessControlRef accessControlRef = SecAccessControlCreateWithFlags(
                                                                         kCFAllocatorDefault,
                                                                         kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
                                                                         kSecAccessControlUserPresence,
                                                                         &accessControlError);
  if (accessControlRef == NULL || accessControlError != NULL) {
    NSLog(@"Can't store identifier '%@' in the KeyChain: %@.", self.keychainItemIdentifier, accessControlError);
    return NO;
  }
  attributes[(__bridge id)kSecAttrAccessControl] = (__bridge id)accessControlRef;
  attributes[(__bridge id)kSecUseNoAuthenticationUI] = @YES;
  // The content of the password is not important.
  attributes[(__bridge id)kSecValueData] = [@"dummy content" dataUsingEncoding:NSUTF8StringEncoding];
  SecItemAdd((__bridge CFDictionaryRef)attributes, NULL);
  return YES;
}

@end
