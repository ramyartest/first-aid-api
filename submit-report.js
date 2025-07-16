<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>📝 Symptom Reporting</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(to right, #fceabb, #f8b500);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
    }

    .container {
      background-color: #ffffffdd;
      width: 90%;
      max-width: 600px;
      margin: 40px auto;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    h2 {
      text-align: center;
      color: #d63031;
      margin-bottom: 20px;
    }

    label {
      font-weight: bold;
      margin-top: 15px;
      display: block;
      color: #2d3436;
    }

    input, textarea {
      width: 100%;
      padding: 12px;
      margin-top: 8px;
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 1em;
    }

    button {
      width: 100%;
      padding: 14px;
      background-color: #00b894;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 1em;
      margin-top: 20px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    button:hover {
      background-color: #019875;
    }

    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 0.85em;
      color: #636e72;
    }
  </style>
</head>
<body>

  <div class="container">
    <h2>📝 Symptom Reporting</h2>

    <label for="userId">User ID</label>
    <input type="text" id="userId" readonly />

    <label for="symptoms">Describe your symptoms:</label>
    <textarea id="symptoms" rows="4" placeholder="e.g., chest pain, dizziness, high fever..."></textarea>

    <button onclick="submitReport()">✅ Submit & Go to Next Page</button>
  </div>

  <div class="footer">© 2025 First Aid Assistant</div>

  <script>
    // Load stored user ID on page load
    window.onload = () => {
      const id = localStorage.getItem("userId");
      if (!id || id.length !== 24) {
        alert("User ID not found or invalid. Redirecting to login...");
        window.location.href = "index.html";
        return;
      }
      document.getElementById("userId").value = id;
    };

    async function submitReport() {
      const userId = document.getElementById("userId").value.trim();
      const text_input = document.getElementById("symptoms").value.trim();

      if (!userId || userId.length !== 24) {
        alert("❌ Invalid or missing User ID.");
        return;
      }

      if (!text_input) {
        alert("❗ Please describe your symptoms.");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/submit-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, text_input, image_url: null })
        });

        const data = await res.json();

        if (res.ok && data.reportId) {
          // Save recommendation data locally
          localStorage.setItem("latestRecommendation", JSON.stringify(data.recommendation));
          localStorage.setItem("latestSymptoms", text_input);
          localStorage.setItem("reportTime", new Date().toLocaleString());

          // Go to next page
          window.location.href = "solution.html";
        } else {
          alert("❌ Error: " + (data.error || "Failed to submit report."));
        }
      } catch (err) {
        console.error("❌ Submit error:", err);
        alert("❌ Network or server error.");
      }
    }
  </script>

</body>
</html>
