import React, { useState, createContext } from "react";

export const UserContext = createContext()

export const StateProvider = (props) => {
    const [user, setUser] = useState({})

    React.useEffect(() => {
        const getData = async () => {
            try {
                const value = await AsyncStorage.getItem('@library_management_app_user_data')
                if (value !== null) {
                    setUser(JSON.parse(value))
                }
            } catch (e) {
                // error reading value
            }
        }
        getData()
    }, [user])

    return (
        <UserContext.Provider value={[user, setUser]}>
            {props.children}
        </UserContext.Provider>
    )
}