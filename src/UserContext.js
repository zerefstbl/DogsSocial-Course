import { getSuggestedQuery } from '@testing-library/react';
import React from 'react'
import { TOKEN_POST, USER_GET, TOKEN_VALIDATE_POST } from './api';
import { useNavigate } from 'react-router-dom';

export const UserContext = React.createContext();


export const UserStorage = ({children}) => {
    const [login, setLogin] = React.useState(null);
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const navigate = useNavigate();

    const userLogout = React.useCallback(async function () {
        setError(null);
        setLoading(false);
        setLogin(false);
        setData(null);
        window.localStorage.removeItem('token');
        navigate('/login');
    }, [navigate]);



    async function getUser(token) {
        const {url, options} = USER_GET(token);
        const response = await fetch(url, options);
        const json = await response.json();
        setData(json);
        setLogin(true);
    }

    async function userLogin(username, password) {
        try {
        setError(null);
        setLoading(true);
        const {url, options} = TOKEN_POST({username, password});
        const tokenRes = await fetch(url, options);
        if (!tokenRes.ok) throw new Error('Error: Usuario inválido');
        const {token} = await tokenRes.json();
        window.localStorage.setItem('token', token);
        await getUser(token);
        navigate('/');
        } catch (err) {
            setError(err.message);
            setLogin(false);
        } finally {
            setLoading(false);
        }
    }

    
    React.useEffect(() => {
        async function autoLogin() {
            const token = window.localStorage.getItem('token');
            if (token) {
                try{
                setError(null)
                setLoading(true)
                const {url, options} = TOKEN_VALIDATE_POST(token);
                const response = await fetch(url, options);
                if (!response.ok) throw new Error('Token inválido');
                await getUser(token)
                } catch (err) {
                    userLogout();
                }  finally {
                    setLoading(false)
                }   
            } 
        }
        autoLogin();
    }, [userLogout])

    return (
    <UserContext.Provider value={{ userLogin, data, userLogout, error, loading, login }}>
        {children}
    </UserContext.Provider>
)
}

export default UserContext
