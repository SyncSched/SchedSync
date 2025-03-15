'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
// import "./login.css"
import scheduleImg from '@/public/assets/schedule.png'
import googleImg from '@/public/assets/google.png'

const quotes = [
    {
        text: "Time is what we want most, but what we use worst.",
        author: "William Penn"
    },
    {
        text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
        author: "Stephen Covey"
    },
    {
        text: "Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin.",
        author: "Mother Teresa"
    },
    {
        text: "Better three hours too soon than a minute too late.",
        author: "William Shakespeare"
    }
];

const Login = () => {
    const router = useRouter();
    const [currentQuote, setCurrentQuote] = useState(0);

    // Quote slider automation
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 5000); // Change quote every 5 seconds

        return () => clearInterval(timer);
    }, []);

    const loginWithGoogle = () => {
        const scope = `https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email`;
        const redirectUri = `http://localhost:3000/auth/google/callback`;
        // const redirectUri = `https://jtxg13v8e1.execute-api.us-east-1.amazonaws.com/default/auth/google/callback`;
        const clientId = `535450891467-v9pu6251j703u36r8l5gsogdrrnkf04a.apps.googleusercontent.com`;
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
        
        window.open(url, "_self");
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            Cookies.set('authToken', token, { expires: 7, sameSite: 'strict' });
            router.push('/');
        }
    }, [router]);

    return (
        <div className="min-h-screen flex items-stretch">
            {/* Left Panel */}
            <div className="w-full md:w-[45%] p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
                <div className="max-w-md mx-auto w-full">
                    {/* Logo/Brand */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-800">SchedSync</h2>
                    </div>

                    {/* Main Content */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            Create an account
                        </h1>
                        <p className="text-gray-600">
                            Sign up and get 30 days free trial
                        </p>
                    </div>

                    {/* Auth Button */}
                    <div className="space-y-4">
                        <button 
                            onClick={loginWithGoogle}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
                        >
                            <Image 
                                src={googleImg}
                                alt="Google Logo" 
                                width={20} 
                                height={20}
                                className="w-5 h-5"
                            />
                            <span>Continue with Google</span>
                        </button>
                    </div>

                    {/* Quote Slider */}
                    <div className="mt-12 relative p-6 rounded-2xl bg-gradient-to-r from-gray-50/50 to-blue-50/50 backdrop-blur-sm">
                        <div className="absolute top-2 left-4 text-4xl text-blue-200 font-serif">&ldquo;</div>
                        <div className="min-h-[100px] flex items-center justify-center">
                            <div 
                                className="text-center transition-opacity duration-500"
                                key={currentQuote} // Force re-render for animation
                            >
                                <p className="text-gray-700 text-sm md:text-base italic mb-2">
                                    {quotes[currentQuote].text}
                                </p>
                                <p className="text-gray-500 text-xs md:text-sm font-medium">
                                    — {quotes[currentQuote].author}
                                </p>
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-4 text-4xl text-blue-200 font-serif rotate-180">&rdquo;</div>
                    </div>

                    {/* Quote Navigation Dots */}
                    <div className="flex justify-center gap-2 mt-4">
                        {quotes.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuote(index)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                    currentQuote === index 
                                        ? 'bg-blue-500 w-3' 
                                        : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Quote ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Illustration */}
            <div className="hidden md:block flex-1 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
                <div className="absolute inset-0 p-12">
                    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                            src={scheduleImg}
                            alt="Schedule Illustration"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Overlay Elements */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent">
                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 inline-block mb-4">
                                    <span className="text-sm font-medium">
                                        Streamline Your Schedule
                                    </span>
                                </div>
                                <h3 className="text-2xl font-semibold mb-2">
                                    Smart Calendar Management
                                </h3>
                                <p className="text-white/80">
                                    Organize your time efficiently with our intelligent scheduling system
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;