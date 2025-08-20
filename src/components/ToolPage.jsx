import React, { useState } from "react";

const ToolPage = ({ title, apiEndpoint }) => {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  // handle file select
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setOutput(null);
  };

  // send to backend
  const handleConvert = async () => {
    if (!file) return alert("Please upload a file first!");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setOutput(url);
    } catch (err) {
      alert("Error during conversion: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      {/* Upload */}
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 border p-2"
      />

      {/* Preview before convert */}
      {file && (
        <p className="mb-4 text-gray-600">
          Selected file: <strong>{file.name}</strong>
        </p>
      )}

      <button
        onClick={handleConvert}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
      >
        {loading ? "Converting..." : "Convert"}
      </button>

      {/* Show converted output */}
      {output && (
        <div className="mt-6">
          <p className="mb-2">Converted File:</p>
          <a
            href={output}
            download={`converted_${file?.name}`}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
};

export default ToolPage;
