document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-register");
  const mensagemEl = document.getElementById("mensagem");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensagemEl.textContent = "";

    // Captura os valores dos campos
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Validação simples no frontend
    if (!email || !password || !confirmPassword) {
      mensagemEl.textContent = "Todos os campos são obrigatórios.";
      return;
    }

    if (password !== confirmPassword) {
      mensagemEl.textContent = "As senhas não coincidem.";
      return;
    }

    try {
      const resposta = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          confirmPassword // necessário para o backend validar
        })
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        mensagemEl.textContent = resultado.erro || "Erro ao registrar usuário.";
        return;
      }

      alert("Usuário registrado com sucesso!");
      window.location.href = "/login/login.html";
    } catch (erro) {
      console.error("Erro de rede:", erro);
      mensagemEl.textContent = "Erro de rede. Tente novamente.";
    }
  });
});