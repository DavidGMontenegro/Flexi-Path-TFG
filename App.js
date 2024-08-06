import registerNNPushToken from 'native-notify';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Main from './components/mainView/Main';
import LoInPage from './components/logIn/LogInPage';
import { StatusBar } from 'expo-status-bar';
import SignUpPage from './components/logIn/signUp/SignUpPage';
import TermsOfService from './components/logIn/signUp/TermsOfService';
import RecoverPassword from './components/logIn/RecoverPassword';
import ReouteHistoryPage from './components/headerNavbar/routeHistory/RouteHistoryPage';
import BookmarkPage from './components/footerNavbar/bookmark/BookmarkPage';
import CategoryBookmarks from './components/footerNavbar/bookmark/places/CategoryBookmarks';
import SearchDestination from './components/newRoute/SearchDestination';
import NewBookmark from './components/footerNavbar/bookmark/places/NewBookmark';
import BookmarkView from './components/footerNavbar/bookmark/places/BookmarkView';
import RoutePage from './components/newRoute/routeView/RoutePage';
import RoutePointsView from './components/newRoute/RoutePointsView';
import RouteView from './components/footerNavbar/bookmark/routes/RouteView';
import RouteDataView from './components/headerNavbar/routeHistory/RouteDataView';
import Destination from './components/newRoute/Destination';
import { AuthProvider } from './AuthContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function App() {
   registerNNPushToken(21031, '6y2Y9hdgxLHvd9DtOgZxwW');
   return (
      <GestureHandlerRootView style={{ flex: 1 }}>
         <SafeAreaProvider>
            <AuthProvider>
               <BottomSheetModalProvider>
                  <StatusBar style="light" backgroundColor="#252525" />
                  <NavigationContainer>
                     <Stack.Navigator initialRouteName="Home" screenOptions={{
                           headerShown: false
                        }}>
                        <Stack.Screen name="Home" component={Main} />
                        <Stack.Screen name="LogIn" component={LoInPage} />
                        <Stack.Screen name="SignUp" component={SignUpPage} />
                        <Stack.Screen name="TermsOfService" component={TermsOfService} />
                        <Stack.Screen name="RecoverPassword" component={RecoverPassword} />
                        <Stack.Screen name="RouteHistory" component={ReouteHistoryPage} />
                        <Stack.Screen name="BookmarkPage" component={BookmarkPage} />
                        <Stack.Screen name="CategoryBookmarks" component={CategoryBookmarks} />
                        <Stack.Screen name="SearchDestination" component={SearchDestination} />
                        <Stack.Screen name="NewBookmark" component={NewBookmark} />
                        <Stack.Screen name="BookmarkView" component={BookmarkView} />
                        <Stack.Screen name="RoutePage" component={RoutePage} />
                        <Stack.Screen name="RoutePointsView" component={RoutePointsView} />
                        <Stack.Screen name="RouteView" component={RouteView} />
                        <Stack.Screen name="RouteDataView" component={RouteDataView} />
                        <Stack.Screen name="Destination" component={Destination} />
                     </Stack.Navigator>
                  </NavigationContainer>
               </BottomSheetModalProvider>
            </AuthProvider>
         </SafeAreaProvider>
      </GestureHandlerRootView>
   );
}
