const axios = require('axios');
const FormData = require('form-data');
// ... your other imports like Turf.js ...

const analyzeRasterWithLocalAI = async (req, res) => {
    try {
        // 1. Create a FormData object to hold the image
        // (Assuming you use 'multer' to receive the image from React into req.file)
        const form = new FormData();
        form.append('file', req.file.buffer, { filename: req.file.originalname });

        // 2. Ping your local Python Sovereign AI Engine
        console.log("Sending raster to local YOLOv8 AI...");
        const aiResponse = await axios.post('http://localhost:8000/api/ai/analyze-raster', form, {
            headers: {
                ...form.getHeaders() // Crucial for multipart file uploads
            }
        });

        // 3. Extract the anomalies flagged by YOLOv8
        const anomalies = aiResponse.data.anomalies;

        // 4. (Optional) Run your Turf.js logic here to verify the anomaly 
        // bounding boxes against the ULPIN boundaries...

        // 5. Send the final, secure JSON payload back to the React frontend
        res.status(200).json({
            message: "Raster analyzed successfully by Sovereign AI",
            anomalies: anomalies
        });

    } catch (error) {
        console.error("AI Microservice Connection Failed:", error.message);
        res.status(500).json({ error: "Failed to reach the local AI engine." });
    }
};

module.exports = { analyzeRasterWithLocalAI };