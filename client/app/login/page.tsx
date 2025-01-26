'use client'
import React from 'react';
// import "./login.css"

const Login = () => {
    const loginWithGoogle = () => {
        const scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
        const redirectUri = "http://localhost:3000/auth/google/callback";
        const clientId = "535450891467-v9pu6251j703u36r8l5gsogdrrnkf04a.apps.googleusercontent.com";
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
        
        // Redirect to the Google authentication endpoint
        window.open(url, "_self");
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the default form submission
        // Add your login logic here
        console.log("Login button clicked");
        // For example, you can perform an API call to authenticate the user
    };

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            localStorage.setItem('authToken', token);
            console.log("Token saved to localStorage:", token);

            // Optionally, redirect to a protected page
            window.location.href = '/';
        }
    }, []);

    return (
        <>
            <div className="login-page">
                <h1 style={{ textAlign: "center" }}>Login</h1>
                <div className="form">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <input type="text" name="" id="" placeholder="username" />
                        <input type="password" name="" id="" placeholder="password" />
                        <button type="submit">Login</button>
                        <p className="message">Not Registered? <a href="#">Create an account</a></p>
                    </form>
                    <button className="login-with-google-btn" onClick={loginWithGoogle}>
                        Sign In With Google
                    </button>
                </div>
            </div>
        </>
    );
};

export default Login;