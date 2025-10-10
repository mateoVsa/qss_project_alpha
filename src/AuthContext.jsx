import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { flushSync } from "react-dom";

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
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    const {token} = res.data;
    localStorage.setItem("token", token)

    const me = await axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

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
