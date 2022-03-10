import {BrowserRouter, Routes, Route} from "react-router-dom";
import Wallet from "./pages/Wallet";

function App() {
  return (
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Wallet />}></Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
