import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port 0.0.0.0:${PORT}`);
});
