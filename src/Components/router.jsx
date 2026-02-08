<>
        <nav>
          <Link to="/">Home</Link> |{" "}
        </nav>

        <Routes>
           <Route path="/" element={<Home />} />
        </Routes>
      </>
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
<button onClick={() => navigate(-1)}>Go back</button>