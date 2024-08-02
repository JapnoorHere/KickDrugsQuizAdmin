import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const inputClass = 'bg-tan-light py-3 px-2 placeholder-brown-light border border-tan-dark focus:outline-none'

  const [form,setForm] = useState({});

  const handleInput = (event)=>{
    setForm({...form,
      [event.target.name] : event.target.value
    })
  }
  
  const submitData = (event)=>{
    event.preventDefault();
    console.log(form.username , form.password);
    axios.post(`${process.env.REACT_APP_API_KEY}/`,{
      username : form.username,
      password : form.password
    }).then((res)=>{
      if(res.data.message === 'done'){
        navigate('/home', {state : {username : form.username}});

      }
      else if(res.data.message === 'incorrect'){
        alert('Incorrect password or username');
      }
    })
  }
  return (
    <>
      <div className='overflow-hidden bg-tan-light min-h-screen w-screen flex justify-center items-center p-4'>
                <form action="" className='border border-tan-dark flex flex-col gap-4 bg-tan-medium w-[400px]  p-6 rounded-lg shadow-lg' onSubmit={submitData}>
                    <h1 className='text-brown-dark text-4xl font-medium'>Register</h1>
                    <p className='mb-4'>Fill your details to continue</p>
                    <input type="text" required placeholder='Username' name='username' value={form.username} className={inputClass} onChange={handleInput}/>
                    <input type="password"  required placeholder='Password' name='password' value={form.password} className={inputClass} onChange={handleInput}/>
                    <button type='submit' className='self-end text-brown-dark w-fit px-6 py-2 bg-tan-dark hover:opacity-90 rounded-sm border border-transparent hover:border-brown-dark '>Next</button>
                </form>
            </div> 
    </>
  )
}

export default Login
