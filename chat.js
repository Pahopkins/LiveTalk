async function send() {
  const msgBox = document.getElementById("msg");
  const chatDiv = document.getElementById("chat");
  const userMsg = msgBox.value;
  msgBox.value = "";

  // Show user message
  chatDiv.innerHTML += `<p><b>You:</b> ${userMsg}</p>`;

  try {
    const response = await fetch("https://livetalk-backend-lsfc.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMsg }],
        propertyDetails: "123 Main St, 4 bed, 3 bath, HOA $250/mo, built 2018"
      })
    });

    const data = await response.json();

    // Extract assistant reply safely
    let aiReply = "No response";
    if (data && data.choices && data.choices.length > 0) {
      aiReply = data.choices[0].message.content;
    }

    chatDiv.innerHTML += `<p><b>AI:</b> ${aiReply}</p>`;
    chatDiv.scrollTop = chatDiv.scrollHeight;

  } catch (error) {
    console.error("Frontend error:", error);
    chatDiv.innerHTML += `<p><b>AI:</b> Error contacting server.</p>`;
  }
}
