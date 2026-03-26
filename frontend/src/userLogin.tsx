
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [userId, setUserId] = useState<number | null>(null);
    const [needs2FA, setNeeds2FA] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8081/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.requires2FA) {
                setNeeds2FA(true);
                setUserId(data.userId);
            } else if (res.ok && data.token) {
                login(data.token);
                navigate('/dashboard');
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            alert('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handle2FA = async () => {
        console.log("Sending 2FA:", { code, userId });
        if (!userId) {
            alert("User session lost. Please login again.");
            setNeeds2FA(false);
            return;
        }

        if (!code) {
            alert('Please enter your 2FA code');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:8081/users/login2FA', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, userId }),
            });

            const data = await res.json();

            if (data.token) {
                await login(data.token)
                navigate('/dashboard')
            } else {
                alert(data.error || 'Invalid 2FA code');
            }
        } catch (err) {
            console.error(err);
            alert('Network error during 2FA verification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '300px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            {!needs2FA ? (
                <form onSubmit={handleLogin}>
                    <h2>Login</h2>

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

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <p>
                        Don't have an account? <a href="/signup">Sign up</a>
                    </p>
                </form>
            ) : (
                <div>
                    <h2>Enter 2FA Code</h2>
                    <input
                        placeholder="6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={handle2FA}
                        disabled={!userId || loading}
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </div>
            )}
        </div>
    );
}//
//         try {
//             const response = await fetch('http://localhost:8081/users/login', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, password }),
//             })
//
//             const data = await response.json()
//
//             // 🔥 CASE 1: 2FA REQUIRED
//             if (data.requires2FA) {
//                 setNeeds2FA(true)
//                 setUserId(data.userId)
//                 return
//             }
//
//             // ✅ CASE 2: normal login
//             if (response.ok && data.token) {
//                 login(data.token)
//                 navigate('/dashboard')
//             } else {
//                 alert(data.error || 'Login failed')
//             }
//
//         } catch (error) {
//             console.error('Error:', error)
//         }
//     }
//     if (needs2FA) {
//         return (
//             <div>
//                 <h2>Enter 2FA Code</h2>
//
//                 <input
//                     placeholder="6-digit code"
//                     value={code}
//                     onChange={(e) => setCode(e.target.value)}
//                 />
//
//                 <button type="button" onClick={verify2FA}>Verify</button>
//             </div>
//         )
//     }
//     return (
//         <form onSubmit={handleSubmit}>
//             <h2>Login</h2>
//
//             <label>Email:</label>
//             <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//             />
//
//             <label>Password:</label>
//             <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//             />
//
//             <button type="submit">Login</button>
//         </form>
//
//     )
// }
//
// //
// // export default LoginForm
// // import { useContext, useState } from 'react';
// // import { useNavigate } from "react-router-dom";
// // import { AuthContext } from "./AuthContext";
// //
// // export function LoginForm() {
// // 	const [username, setUsername] = useState("");
// // 	const [password, setPassword] = useState("");
// // 	const [email, setEmail] = useState("");
// // 	const [isLogin, setIsLogin] = useState(true);
// //   const { login } = useContext(AuthContext);
// //
// //     const navigate = useNavigate();
// //
// //   	const handleSubmit = async (event: any) => {
// //     event.preventDefault();
// //
// //
// //
// // 	const endpoint = isLogin ? "http://localhost:8081/users/login" : "http://localhost:8081/users/signup";
// //     const payload = isLogin ? { email, password } : { username, email, password }; // Using all three for signup
// //     try {
// //       const response = await fetch(endpoint, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json"},
// //         body: JSON.stringify(payload),
// //       });
// //
// // 	  const contentType = response.headers.get("content-type");
// //
// // 	  if (!contentType || !contentType.includes("application/json")) {
// //       	const rawText = await response.text();
// //       	throw new Error(`Server sent non-JSON response: ${rawText}`);
// //     	}
// //
// // 		const data = await response.json();
// //
// // 	  if (response.ok) {
// //         if (isLogin && data.token) {
// // 			login(data.token); // this stores the token and updates user state in AuthContext
// // 			const meResponse = await fetch("http://localhost:8081/users/me",{
// // 				method: "GET",
// // 				headers: {
// // 					Authorization: `Bearer ${data.token}`
// // 				},
// // 			});
// // 			if (!meResponse.ok) {
// // 				throw new Error("Failed to fetch user data after login");
// // 			}
// // 			const meData = await meResponse.json();
// // 			console.log("Fetched user data after login:", meData);
// // 			navigate("/dashboard");
// // 		} else {
// // 		console.log("Signup successful, user data:", data);
// //           //alert("Account created! Now please log in.");
// //           setIsLogin(true); // Switch them to the login screen
// //         }
// //       } else {
// //         alert(data.error || "Something went wrong");
// //       }
// //     } catch (error: any) {console.error("Network error:", error);}
// // }
// //
// //  return (
// //     <div style={{ maxWidth: '300px', margin: '50px auto', fontFamily: 'sans-serif' }}>
// //       <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
// //
// //       <form onSubmit={handleSubmit}>
// //         {/* Sign Up Specific Field */}
// //         {!isLogin && (
// //           <>
// //             <label htmlFor="username">Username:</label><br/>
// //             <input
// //               type="text"
// //               id="username"
// //               value={username}
// //               onChange={(e) => setUsername(e.target.value)}
// //               required
// //             /><br/><br/>
// //           </>
// //         )}
// //
// //         <label htmlFor="email">Email:</label><br/>
// //         <input
// //           type="email"
// //           id="email"
// //           value={email}
// //           onChange={(e) => setEmail(e.target.value)}
// //           required
// //         /><br/><br/>
// //
// //         <label htmlFor="password">Password:</label><br/>
// //         <input
// //           type="password"
// //           id="password"
// //           value={password}
// //           onChange={(e) => setPassword(e.target.value)}
// //           required
// //         /> <br/><br/>
// //
// //         <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
// //           {isLogin ? 'Login' : 'Sign Up'}
// //         </button>
// //       </form>
// //
// //       <p style={{ marginTop: '20px', textAlign: 'center' }}>
// //         {isLogin ? "Don't have an account?" : "Already have an account?"}
// //         <button
// //           onClick={() => setIsLogin(!isLogin)}
// //           style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
// //         >
// //           {isLogin ? 'Sign Up' : 'Login'}
// //         </button>
// //       </p>
// //     </div>
// //   );
// // }
// //
// // export default LoginForm;