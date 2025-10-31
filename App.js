// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import CreatePrescriptionScreen from './screens/CreatePrescriptionScreen';
import PrescriptionSystemScreen from './screens/PrescriptionSystemScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PrescriptionSystem" component={PrescriptionSystemScreen} />
        <Stack.Screen name="CreatePrescription" component={CreatePrescriptionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}