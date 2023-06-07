import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import PdfReaderScreen from './screens/PdfReaderScreen';
import SigninScreen from './screens/SigninScreen';
import SignupScreen from './screens/SignupScreen';
const Stack = createNativeStackNavigator();
import FlashMessage from "react-native-flash-message";
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BookPreviewScreen from './screens/BookPreviewScreen';
import { StateProvider } from './context/UserContext';

export default function App() {

  return (
    <StateProvider>
      <View style={styles.container}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'Signin'}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="BookPreview" component={BookPreviewScreen} />
            <Stack.Screen name="PdfReaderScreen" component={PdfReaderScreen} options={{ animation: 'none' }} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Signin" component={SigninScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <FlashMessage position="top" />
      </View>
    </StateProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
});
