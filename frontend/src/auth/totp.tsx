import { useState } from "react"

export function Enable2FA() {
    const [qr, setQr] = useState("")
    const [code, setCode] = useState("")

    const getQR = async () => {
        const res = await fetch("http://localhost:8081/2fa/generate")
        const data = await res.json()
        setQr(data.qr)
    }

    const verify = async () => {
        const res = await fetch("http://localhost:8081/2fa/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
        })

        const data = await res.json()
        console.log(data)
    }

    return (
        <div>
            <h2>Enable 2FA</h2>

            <button onClick={getQR}>Generate QR</button>

            {qr && <img src={qr} alt="QR Code" />}

            <input
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />

            <button onClick={verify}>Verify</button>
        </div>
    )
}