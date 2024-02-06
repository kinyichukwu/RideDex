import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, database } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

import { toast } from "react-toastify";

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const usersRef = collection(database, "usersList");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const getUser = async () => {
      setUser(null);
      onAuthStateChanged(auth, async (data) => {
        const signUpDate = new Date(auth.currentUser.metadata.creationTime);
        const signUpTime = new Date(auth.currentUser.metadata.creationTime);
        const lastsignInTime = Timestamp.now();
        if (data) {
          try {
            const document = await getDoc(doc(usersRef, data.phoneNumber));
            if (document.exists()) {
              await updateDoc(doc(usersRef, data.phoneNumber), {
                joinedDate: signUpDate.toDateString(),
                joinedTime: signUpTime.toLocaleTimeString(),
                lastLoginTime: lastsignInTime,
              });
            }
            localStorage.setItem("RideDexUser", JSON.stringify(data));
            setUser(data);
            console.log(data);
          } catch (err) {
            console.log(err.message);
          } finally {
            setLoading(false);
          }
        }
      });
    };
    getUser();
  }, []);

  const value = {
    navigate,
    usersRef,
    user,
    setUser,
    loading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
