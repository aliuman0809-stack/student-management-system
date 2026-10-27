import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        // Backend se user details fetch karein
        // Kyunke humne backend mein API nahi banayi session wali, 
        // filhal hum dummy user set kar rahe hain taake test ho sake.
        // Asal project mein yahan backend se user info aati hai.
        
        const user = {
            id: 1, // Test ID
            name: "Google User",
            email: "googleuser@gmail.com",
            role: "USER"
        };

        // Session mein save karein
        sessionStorage.setItem("studentUser", JSON.stringify(user));
        
        // Dashboard par bhej dein
        navigate("/students", { replace: true });
    }, [navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
            <h2>Logging you in with Google... Please wait.</h2>
        </div>
    );
}