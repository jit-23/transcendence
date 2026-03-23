import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function Dashboard() {
	console.log("Dashboard component rendered"); // Debugging line
	const { user, logout } = useContext(AuthContext);
	//const { addFriends } = useContext(AuthContext);
	console.log("Dashboard user:", user?.email); // Debugging line
	console.log("Dashboard user:", user?.name); // Debugging line
  return (
    <div>
      <h1>Welcome {user?.name}</h1>

      <button onClick={logout}>
        Logout
      </button>
		<b/>
	  <button onClick={() => alert("Add friends functionality coming soon!")}>
        Add Friends
      </button>
    </div>
  );
}
export default Dashboard;