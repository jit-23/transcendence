import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SignupForm() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
                navigate('/login')
            } else {
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
}

export default SignupForm