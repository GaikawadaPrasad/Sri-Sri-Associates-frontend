import { createContext, useState } from "react";


export const AuthContext = createContext();
export const AuthProvider = ({children}) => {
    const [user , setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null'); }
        catch { return null; }
    });
    const [loading , setLoading] = useState(false);
    
    const login = async (userData , token) => {
        localStorage.setItem('token' , token);
        localStorage.setItem('user' , JSON.stringify(userData));

        setUser(userData);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    }

    const value = {
        user,
        login,
        logout,
        loading,
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}