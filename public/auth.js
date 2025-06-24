// public/auth.js
async function verificarUsuario() {
  try {
    const resp = await fetch("/api/user");
    // Sempre 200 agora
    const data = await resp.json();
    const nav = document.getElementById("nav-login");
    if (!nav) return;
    nav.innerHTML = '';
    if (data.authenticated) {
      // usuário logado
      const span = document.createElement('span');
      span.textContent = `Olá, ${data.email}`;
      span.style.marginRight = '8px';
      nav.appendChild(span);
      const btnLogout = document.createElement('button');
      btnLogout.textContent = 'Logout';
      btnLogout.className = 'botao';
      btnLogout.addEventListener('click', async () => {
        await fetch("/api/logout");
        window.location.href = "/";
      });
      nav.appendChild(btnLogout);
      if (data.isAdmin) {
        const linkAdmin = document.createElement('a');
        linkAdmin.href = "/admin/pedidos.html";
        linkAdmin.textContent = 'Admin';
        linkAdmin.style.marginLeft = '8px';
        nav.appendChild(linkAdmin);
      }
    } else {
      // não autenticado
      const linkLogin = document.createElement('a');
      linkLogin.href = "/login/login.html";
      linkLogin.textContent = 'Login';
      linkLogin.style.marginRight = '8px';
      nav.appendChild(linkLogin);
      const linkRegister = document.createElement('a');
      linkRegister.href = "/register/register.html";
      linkRegister.textContent = 'Registrar';
      nav.appendChild(linkRegister);
    }
  } catch (err) {
    console.error("auth.js erro:", err);
    // se der erro de rede, apenas não exibe links, mas não impede script.js
  }
}

document.addEventListener('DOMContentLoaded', () => {
  verificarUsuario();
});