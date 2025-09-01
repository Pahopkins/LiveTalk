async function send() {
  const msgBox = document.getElementById("msg");
  const chatDiv = document.getElementById("chat");
  const userMsg = msgBox.value;
  msgBox.value = "";

  // Add user bubble
  chatDiv.innerHTML += `<div class="message user"><b>You:</b><br>${userMsg}</div>`;
  chatDiv.scrollTop = chatDiv.scrollHeight;

  try {
    const response = await fetch("https://livetalk-backend-lsfc.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMsg }]
      })
    });

    const data = await response.json();

    let aiReply = "No response";
    if (data && data.choices && data.choices.length > 0) {
      aiReply = data.choices[0].message.content;
    }

    // Render AI response with Markdown support
    chatDiv.innerHTML += `<div class="message ai"><b>Katie:</b><br>${marked.parse(aiReply)}</div>`;
    chatDiv.scrollTop = chatDiv.scrollHeight;

  } catch (error) {
    console.error("Frontend error:", error);
    chatDiv.innerHTML += `<div class="message ai"><b>Katie:</b> Error contacting server.</div>`;
  }
}
