document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-login");
  const mensagemEl = document.getElementById("mensagem");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensagemEl.textContent = '';

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Validação simples de email
    if (!email || !password) {
      mensagemEl.textContent = 'Preencha email e senha.';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      mensagemEl.textContent = 'Formato de email inválido.';
      return;
    }

    try {
      const resp = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        mensagemEl.textContent = data.erro || 'Erro ao fazer login.';
      } else {
        // Login bem-sucedido: redireciona conforme role
        if (data.isAdmin) {
          window.location.href = "/"; // ou outra rota admin
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      console.error("Erro no fetch /api/login:", err);
      mensagemEl.textContent = 'Erro de rede ao fazer login.';
    }
  });
});