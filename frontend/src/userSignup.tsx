import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SignupForm() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [qr, setQr] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            const response = await fetch('http://localhost:8081/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                console.log('Signup success:', data)

                if (data.qr) {
                    setQr(data.qr) // 👈 show QR instead of redirect
                } else {
                    navigate('/login')
                }
            }else {
                alert(data.error || 'Signup failed')
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Account</h2>

            <label>Username:</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <label>Email:</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <label>Password:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <button type="submit">Sign Up</button>
            <p>
                Already have an account? <a href="/login">Login</a>
            </p>
        </form>


    )
    {qr && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h3>Scan this QR with Google Authenticator</h3>
            <img src={qr} alt="2FA QR Code" />
            <br /><br />
            <button onClick={() => navigate('/login')}>
                Continue to Login
            </button>
        </div>
    )}
}

export default SignupForm


// import { useState } from 'react'
//
// export function SignupForm() {
//     const [username, setUsername] = useState('')
//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')
//
//     const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault()
//
//         try {
//             const response = await fetch('http://localhost:8081/users', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     name: username,
//                     email: email,
//                     password,
//                 }),
//             })
//
//             if (!response.ok) {
//                 throw new Error('Failed to register')
//             }
//
//             const data = await response.json()
//             console.log('Success:', data)
//
//         } catch (error) {
//             console.error('Error:', error)
//         }
//     }
//
//     return (
//         <form onSubmit={handleSubmit}>
//             <h2>Register</h2>
//
//             <label htmlFor="username">Username:</label>
//             <input
//                 type="text"
//                 id="username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//             />
//
//             <label htmlFor="email">Email:</label>
//             <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//             />
//
//             <label htmlFor="password">Password:</label>
//             <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//             />
//
//             <button type="submit">Register</button>
//         </form>
//     )
// }
//
// export default SignupForm