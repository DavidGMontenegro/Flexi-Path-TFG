// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUsername(userData.username);
          setName(userData.name);
          setEmail(userData.email);
          setUid(userData.uid);
          setCurrentUser(userData.currentUser);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to load user data from AsyncStorage", error);
      }
    };

    loadAuthData();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, username, setUsername, name, setName, email, setEmail, uid, setUid, currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
