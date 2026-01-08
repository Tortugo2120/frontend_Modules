import {useState} from "react";
import {apiLogin, formLogin} from "../services/auth";

const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const login = async (form:formLogin) => {
        setError("");
        setLoading(true);
        try {
            const response = await apiLogin(form);
            return response.data.token;
        }catch (err) {
            console.log("Error al intentar login",err.response);
            const error = err.response?.data?.messages?.error;
            if (error) {
                setError(error);
            }
        }finally {
            setLoading(false);
        }
    }
    return{loading, error,login};
}