import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth, API_URL } from '../App';

export const Signup = () => {
  const { register, handleSubmit, setError, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const mut = useMutation({
    mutationFn: (d) => axios.post(`${API_URL}/users/signup`, d).then(r => r.data),
    onSuccess: (r) => { login(r.data.user); navigate('/'); },
    onError: (e) => setError('root', { message: e.response?.data?.error || 'Signup failed' })
  });

  // Helper to get the first available error message
  const errorMessage = errors.root?.message || 
                       errors.name?.message || 
                       errors.email?.message || 
                       errors.password?.message;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit(d => mut.mutate(d))} className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md space-y-6">
        <h2 className="text-4xl font-black text-center text-slate-900 tracking-tight">Create Account</h2>
        
        {/* UPDATED: Displays warning if server error OR validation error exists */}
        {(mut.isError || Object.keys(errors).length > 0) && (
          <div className="bg-red-50 p-3 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-black uppercase">
            <AlertCircle size={14}/> 
            {errorMessage || "Check your details"}
          </div>
        )}

        <input 
          {...register('name', { required: "Name is required" })} 
          placeholder="Name" 
          className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600" 
        />

        <input 
          type="email"
          {...register('email', { 
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Invalid email format"
            }
          })} 
          placeholder="Email" 
          className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600" 
        />

        <input 
          type="password"
          {...register('password', { 
            required: "Password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" }
          })} 
          placeholder="Password" 
          className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600" 
        />

        <button type="submit" disabled={mut.isLoading} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform active:scale-95 uppercase">
          {mut.isLoading ? 'Processing...' : 'Start Now'}
        </button>
        
        <p className="text-center text-sm font-bold text-slate-400">
          Already a member? <span onClick={() => navigate('/login')} className="text-blue-600 cursor-pointer hover:underline">Log in</span>
        </p>
      </form>
    </div>
  );
};

export const Login = () => {
  const { register, handleSubmit, setError, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const mut = useMutation({
    mutationFn: (d) => axios.post(`${API_URL}/users/login`, d).then(r => r.data),
    onSuccess: (r) => { login(r.data.user); navigate('/'); },
    onError: (e) => setError('root', { message: e.response?.data?.error || 'Login failed' })
  });

  const loginErrorMessage = errors.root?.message || errors.email?.message || errors.password?.message;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit(d => mut.mutate(d))} className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center font-black text-white text-3xl shadow-xl shadow-blue-200">F</div>
        </div>
        <h2 className="text-4xl font-black text-center text-slate-900 tracking-tight">Welcome Back</h2>
        
        {/* UPDATED: Dynamic Login Error messaging */}
        {(mut.isError || Object.keys(errors).length > 0) && (
          <div className="bg-red-50 p-3 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-black uppercase">
            <AlertCircle size={14}/> 
            {loginErrorMessage || "Login Failed"}
          </div>
        )}

        <input 
          type="email"
          {...register('email', { 
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Invalid email format"
            }
          })} 
          placeholder="Email Address" 
          className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600" 
        />

        <input 
          type="password"
          {...register('password', { required: "Password is required" })} 
          placeholder="Password" 
          className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600" 
        />

        <button type="submit" disabled={mut.isLoading} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform active:scale-95 uppercase tracking-widest">
          {mut.isLoading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
        </button>

        <p className="text-center text-sm font-bold text-slate-400">
          New here? <span onClick={() => navigate('/signup')} className="text-blue-600 cursor-pointer hover:underline">Join Now</span>
        </p>
      </form>
    </div>
  );
};

export const Unauthorized = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center flex-col gap-6 text-center p-6">
    <div className="bg-red-500 text-white p-8 rounded-[40px] shadow-2xl animate-bounce"><AlertCircle size={64} /></div>
    <h1 className="text-5xl font-black text-white tracking-tight uppercase">403: Access Denied</h1>
    <button onClick={() => window.location.href = "/"} className="bg-white text-slate-900 font-black px-10 py-4 rounded-2xl hover:bg-slate-200 transition-all">Back to Safety</button>
  </div>
);