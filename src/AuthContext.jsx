import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { flushSync } from "react-dom";
import API_URL from "./config/api";
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading]= useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) 
        {
          setLoading(false);
          return;
        }

      try {
        // const res = await axios.get("https://qss-backend-zed8.onrender.com/api/auth/me", {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        const res = await axios.get(`${API_URL}/api/auth/me`,{
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(res.data.user);
      } catch (err){
        console.error("Token invalido o expirado", err)
        localStorage.removeItem("token");
        setUser(null);
      }finally{
        setLoading(false)
      }
    };

    loadUser();
  }, []);

  //Funcion para login centralizado

  const login = async(email, password)=>{
    // const res = await axios.post("https://qss-backend-zed8.onrender.com/api/auth/login", {
    //   email,
    //   password,
    // });
    const res = await axios.post(`${API_URL}/api/auth/login`,{
      email,
      password,
    })

    const {token} = res.data;
    localStorage.setItem("token", token)

    // const me = await axios.get("https://qss-backend-zed8.onrender.com/api/auth/me", {
    //   headers: { Authorization: `Bearer ${token}` },
    // });
    const me = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setUser(me.data.user);
    return me.data.user;
  };

  //funtion logout

  const logout = ()=>{
    localStorage.removeItem("token");
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
