import React, { useState } from 'react';

const SovereignAIUploader = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [anomalies, setAnomalies] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a satellite image first!");

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Notice we are hitting Port 5000 (Express), NOT 8000 (Python)!
            // Node.js will handle the secure handoff to Python for us.
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/analyze-raster`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setAnomalies(data.anomalies);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Error connecting to the Express backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Sovereign AI Scanner</h2>
            <p className="text-sm text-gray-500">Upload a raster image to detect unpermitted pits.</p>

            <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-400"
            >
                {loading ? "AI is analyzing..." : "Scan for Anomalies"}
            </button>

            {/* Display the AI Results */}
            {anomalies && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-green-600 mb-2">Scan Complete!</h3>
                    {anomalies.length > 0 ? (
                        anomalies.map((anomaly, index) => (
                            <div key={index} className="text-sm text-gray-700 border-b pb-2 mb-2">
                                <p><span className="font-bold text-red-500">Alert:</span> {anomaly.type}</p>
                                <p><span className="font-bold">Confidence:</span> {(anomaly.confidence * 100).toFixed(1)}%</p>
                                <p><span className="font-bold">Coordinates:</span> [{anomaly.bounding_box.map(n => n.toFixed(2)).join(', ')}]</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-600">No anomalies detected in this sector.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SovereignAIUploader;