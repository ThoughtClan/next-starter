import logo from "../../assets/images/logo.svg";
import useAuth from "../../hooks/useAuth";

import "./login.scss";

export default function Login() {
  const auth = useAuth();

  const onFakeLogin = () => {
    const user = { id: "1", name: "John Doe" };

    localStorage.setItem("user", JSON.stringify(user));
    auth.setUser(user);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button type="button" className="App-link" onClick={onFakeLogin}>
          Mock Login
        </button>
      </header>
    </div>
  );
}
