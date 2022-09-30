import logo from "../../assets/images/logo.svg";
import useAuth from "../../hooks/useAuth";

import "./home.scss";

export default function Home() {
  const auth = useAuth();

  const onFakeLogout = () => {
    localStorage.removeItem("user");
    auth.setUser(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h4>Hello, {auth.user?.name}</h4>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <button type="button" className="App-link" onClick={onFakeLogout}>
          Mock Logout
        </button>
      </header>
    </div>
  );
}
