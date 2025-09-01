async function send() {
  const msgBox = document.getElementById("msg");
  const chatDiv = document.getElementById("chat");
  const userMsg = msgBox.value;
  msgBox.value = "";

  chatDiv.innerHTML += `<p><b>You:</b> ${userMsg}</p>`;

const response = await fetch("https://livetalk-backend-lsfc.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: userMsg }],
      propertyDetails: "123 Main St, 4 bed, 3 bath, HOA $250/mo, built 2018"
    })
  });

  const data = await response.json();
  chatDiv.innerHTML += `<p><b>AI:</b> ${data.choices[0].message.content}</p>`;
  chatDiv.scrollTop = chatDiv.scrollHeight;
}
