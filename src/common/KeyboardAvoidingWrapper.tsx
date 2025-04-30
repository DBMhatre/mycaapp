// KeyboardAvoidingWrapper.js
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

type KeyboardAvoidingWrapperProps = {
  children: React.ReactNode;
};

const KeyboardAvoidingWrapper = ({ children }: KeyboardAvoidingWrapperProps) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // ADJUST IF YOU HAVE HEADER
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled" // STILL LETS YOU FOCUS NEXT INPUT
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
});

export default KeyboardAvoidingWrapper;
