import { useState } from 'react';
//import  bcrypt   from 'bcrypt';

import jwt from 'jsonwebtoken';

export function LoginForm() { 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
	

  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async(event:any) => {
    event.preventDefault();

	const payload = isLogin	? { username, password }: { username, email, password };
	//console.log("payload: ", payload);
	await fetch("http://localhost:8081/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )
  };

 return ( 
    <div style={{ maxWidth: '300px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Sign Up Specific Field */}
        {!isLogin && (
          <>
            <label htmlFor="username">Username:</label><br/>
            <input 
              type="text" 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            /><br/><br/>
          </>
        )}

        <label htmlFor="email">Email:</label><br/>
        <input 
          type="email" 
          id="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        /><br/><br/>

        <label htmlFor="password">Password:</label><br/>
        <input 
          type="password" 
          id="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        /> <br/><br/>

        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"} 
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
}

export default LoginForm;
