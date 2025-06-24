function mostrarPix() {
    document.getElementById("form-cartao").style.display = "none";
    document.getElementById("qr-pix").style.display = "flex";
    window.scrollTo({ top: document.getElementById("qr-pix").offsetTop, behavior: "smooth" });
  }
  
  function mostrarCartao() {
    document.getElementById("qr-pix").style.display = "none";
    document.getElementById("form-cartao").style.display = "block";
    window.scrollTo({ top: document.getElementById("form-cartao").offsetTop, behavior: "smooth" });
  }
  
  if (window.location.hash === "#pix") mostrarPix();
  else if (window.location.hash === "#cartao") mostrarCartao();
  
  // Máscaras
  IMask(document.getElementById('numero-cartao'), {
    mask: '0000 0000 0000 0000'
  });
  
  IMask(document.getElementById('cpf'), {
    mask: '000.000.000-00'
  });
  
  IMask(document.getElementById('validade'), {
    mask: '00/00'
  });
  
  IMask(document.getElementById('cvv'), {
    mask: '000'
  });
  
  // Validações
  function validarCartao(numero) {
    const reverso = numero.replace(/\D/g, "").split("").reverse();
    let soma = 0;
    for (let i = 0; i < reverso.length; i++) {
      let n = parseInt(reverso[i]);
      if (i % 2 === 1) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      soma += n;
    }
    return soma % 10 === 0;
  }
  
  function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let d1 = 11 - (soma % 11);
    if (d1 >= 10) d1 = 0;
    if (d1 !== parseInt(cpf[9])) return false;
  
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    let d2 = 11 - (soma % 11);
    if (d2 >= 10) d2 = 0;
    return d2 === parseInt(cpf[10]);
  }
  
  function validadeValida(valor) {
    const [mes, ano] = valor.split("/").map(Number);
    if (!mes || !ano || mes < 1 || mes > 12) return false;
  
    const agora = new Date();
    const anoAtual = parseInt(agora.getFullYear().toString().slice(2));
    const mesAtual = agora.getMonth() + 1;
  
    return ano > anoAtual || (ano === anoAtual && mes >= mesAtual);
  }
  
  document.getElementById("form-cartao").addEventListener("submit", function (e) {
    const numero = document.getElementById("numero-cartao").value.replace(/\D/g, "").trim();
    const nome = document.getElementById("nome-cartao").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const validade = document.getElementById("validade").value.trim();
    const cvv = document.getElementById("cvv").value.trim();
  
    if (!/^\d{16}$/.test(numero) || !validarCartao(numero)) {
      alert("Número do cartão inválido.");
      return e.preventDefault();
    }
  
    if (nome.split(" ").length < 2) {
      alert("Digite o nome completo como está no cartão.");
      return e.preventDefault();
    }
  
    if (!validarCPF(cpf)) {
      alert("CPF inválido.");
      return e.preventDefault();
    }
  
    if (!/^\d{2}\/\d{2}$/.test(validade) || !validadeValida(validade)) {
      alert("Validade inválida. Use o formato MM/AA e uma data futura.");
      return e.preventDefault();
    }
  
    if (!/^\d{3}$/.test(cvv)) {
      alert("CVV inválido. Deve conter 3 dígitos.");
      return e.preventDefault();
    }
  
    alert("Pagamento validado com sucesso!");
  });
  