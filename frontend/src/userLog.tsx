import { useState } from 'react';

export function LoginForm() {
  const [name, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async(event:any) => {
    event.preventDefault();

    console.log("Sending:", { name, password });
    console.log("Sending to back:",JSON.stringify({ name, password }));
    await fetch("http://localhost:8081/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, password }),
    }
  )
    .then(response => response.json())
    .catch(error => console.error("Error:", error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username:</label><br/>
      <input 
        type="text" 
        id="username" 
        value={name} 
        onChange={(e) => setUsername(e.target.value)} 
        required 
      /><br/><br/>

      <label htmlFor="password">Password:</label><br/>
      <input 
        type="password" 
        id="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required/>
      <br/><br/>

      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;

/* import {useState} from 'react'

export function LoginForm(){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = (event: any) =>{
    event.preventDefault();

    console.log(username);
    console.log(password);

    fetch("http://localhost:8081/users", {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
});
  }
} */

////

