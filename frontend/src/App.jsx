import Navbar from './components/navbar.component';
import { Routes, Route } from 'react-router-dom';
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route path="signup" element={<h1>Sign Up page</h1>} />
        <Route path="signin" element={<h1>Sign In page</h1>} />
      </Route>
    </Routes>
  );
};

export default App;
