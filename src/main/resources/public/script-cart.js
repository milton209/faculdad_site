document.addEventListener("DOMContentLoaded", () => {
  // ======================================================
  // MÓDULO 1: AUTENTICAÇÃO, MODAL E RECUPERAÇÃO DE SENHA
  // ======================================================
  const profileBtn = document.getElementById("profile-btn");
  const modal = document.getElementById("auth-modal");
  const closeBtn = modal ? modal.querySelector(".close-btn") : null;
  const tabBtns = modal ? modal.querySelectorAll(".tab-btn") : [];
  const authForms = modal ? modal.querySelectorAll(".auth-form") : []; // Inclui login, signup E recover
  const signupFormModal = document.getElementById("signup-form-modal");
  const loginFormModal = document.getElementById("login-form-modal");
  const loginErrorMessage = document.getElementById("login-error-message");
  const profileTooltip = profileBtn
    ? profileBtn.querySelector(".tooltip")
    : null;
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  const recoverForm = document.getElementById("recover-form");
  const recoverFormModal = document.getElementById("recover-form-modal");
  const backToLoginLink = document.getElementById("back-to-login-link");
  const recoverMessage = document.getElementById("recover-message");

  // --- Lógica de Abrir/Fechar Modal e Abas ---
  if (profileBtn) {
    profileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (profileTooltip && profileTooltip.textContent === "Sair") {
        handleLogout();
      } else {
        if (modal) {
          modal.style.display = "flex";
          showAuthForm("login-form");
          if (loginErrorMessage) loginErrorMessage.style.display = "none";
        } else {
          console.error("Modal de autenticação não encontrado!");
        }
      }
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  } else if (modal) {
    console.warn("Botão de fechar do modal de autenticação não encontrado.");
  }
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      if (modal) modal.style.display = "none";
    }
  });

  function showAuthForm(formIdToShow) {
    authForms.forEach((form) => {
      if (form) {
        form.style.display = form.id === formIdToShow ? "block" : "none";
        form.classList.toggle("active", form.id === formIdToShow);
      }
    });
    const modalTabs = modal ? modal.querySelector(".modal-tabs") : null;
    if (modalTabs) {
      if (formIdToShow === "login-form" || formIdToShow === "signup-form") {
        const tabId = formIdToShow.replace("-form", "");
        tabBtns.forEach((btn) =>
          btn.classList.toggle("active", btn.dataset.tab === tabId)
        );
        modalTabs.style.display = "flex";
      } else if (formIdToShow === "recover-form") {
        modalTabs.style.display = "none";
      }
    }
  }
  function showRecoverForm() {
    showAuthForm("recover-form");
    if (recoverMessage) recoverMessage.style.display = "none";
    const recoverEmailInput = document.getElementById("recover-email");
    if (recoverEmailInput) recoverEmailInput.value = "";
  }
  function hideRecoverForm() {
    showAuthForm("login-form");
  }
  tabBtns.forEach((button) => {
    button.addEventListener("click", () => {
      showAuthForm(button.dataset.tab + "-form");
      if (loginErrorMessage) loginErrorMessage.style.display = "none";
      if (recoverMessage) recoverMessage.style.display = "none";
    });
  });
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      showRecoverForm();
    });
  }
  if (backToLoginLink) {
    backToLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      hideRecoverForm();
    });
  }

  // --- LÓGICA DE CADASTRO com localStorage ---
  if (signupFormModal) {
    signupFormModal.addEventListener("submit", (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById("signup-name");
      const emailInput = document.getElementById("signup-email");
      const passwordInput = document.getElementById("signup-password");
      const username = usernameInput ? usernameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
      const password = passwordInput ? passwordInput.value : "";
      if (!username || !email || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        alert("Por favor, insira um e-mail válido.");
        return;
      }
      let users = JSON.parse(localStorage.getItem("fake_users")) || [];
      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        alert("Erro: Este e-mail já está cadastrado.");
        return;
      }
      const newUser = { username, email, password };
      users.push(newUser);
      localStorage.setItem("fake_users", JSON.stringify(users));
      alert("Cadastro realizado com sucesso! Por favor, faça o login.");
      if (usernameInput) usernameInput.value = "";
      if (emailInput) emailInput.value = "";
      if (passwordInput) passwordInput.value = "";
      showAuthForm("login-form");
    });
  }
  // --- LÓGICA DE LOGIN com localStorage ---
  if (loginFormModal) {
    loginFormModal.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("login-email");
      const passwordInput = document.getElementById("login-password");
      const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
      const password = passwordInput ? passwordInput.value : "";
      if (!email || !password) {
        if (loginErrorMessage) {
          loginErrorMessage.textContent = "Por favor, preencha e-mail e senha.";
          loginErrorMessage.style.display = "block";
        } else {
          alert("Por favor, preencha e-mail e senha.");
        }
        return;
      }
      let users = JSON.parse(localStorage.getItem("fake_users")) || [];
      const foundUser = users.find(
        (user) => user.email === email && user.password === password
      );
      if (foundUser) {
        localStorage.setItem("current_user", JSON.stringify(foundUser));
        if (modal) modal.style.display = "none";
        updateProfileButton(foundUser.username);
        alert(`Bem-vindo de volta, ${foundUser.username}!`);
        if (emailInput) emailInput.value = "";
        if (passwordInput) passwordInput.value = "";
        if (loginErrorMessage) loginErrorMessage.style.display = "none";
      } else {
        if (loginErrorMessage) {
          loginErrorMessage.textContent = "E-mail ou senha incorretos.";
          loginErrorMessage.style.display = "block";
        } else {
          alert("E-mail ou senha incorretos.");
        }
        if (passwordInput) passwordInput.value = "";
      }
    });
  }
  // --- LÓGICA DE RECUPERAÇÃO DE SENHA SIMULADA ---
  if (recoverFormModal) {
    recoverFormModal.addEventListener("submit", (e) => {
      e.preventDefault();
      const recoverEmailInput = document.getElementById("recover-email");
      const emailToRecover = recoverEmailInput
        ? recoverEmailInput.value.trim().toLowerCase()
        : "";
      if (!emailToRecover || !/\S+@\S+\.\S+/.test(emailToRecover)) {
        if (recoverMessage) {
          recoverMessage.textContent = "Por favor, insira um e-mail válido.";
          recoverMessage.style.color = "var(--vermelho-principal, #DC143C)";
          recoverMessage.style.display = "block";
        } else {
          alert("Por favor, insira um e-mail válido.");
        }
        return;
      }
      if (recoverMessage) {
        recoverMessage.textContent =
          "Se este e-mail estiver cadastrado, um link de recuperação foi enviado.";
        recoverMessage.style.color = "var(--branco-detalhe, #F0F0F0)";
        recoverMessage.style.display = "block";
      } else {
        alert(
          "Se este e-mail estiver cadastrado, um link de recuperação foi enviado."
        );
      }
      if (recoverEmailInput) recoverEmailInput.value = "";
    });
  }
  // --- FUNÇÕES de LOGIN STATUS e LOGOUT ---
  function updateProfileButton(username) {
    if (profileBtn && profileTooltip) {
      if (username) {
        profileTooltip.textContent = "Sair";
      } else {
        profileTooltip.textContent = "Perfil";
      }
    }
  }
  function handleLogout() {
    localStorage.removeItem("current_user");
    updateProfileButton(null);
    alert("Você saiu da sua conta.");
  }
  function checkLoginStatus() {
    const currentUserData = localStorage.getItem("current_user");
    if (currentUserData) {
      try {
        const currentUser = JSON.parse(currentUserData);
        updateProfileButton(currentUser.username);
      } catch (e) {
        console.error("Erro ao ler dados do usuário logado:", e);
        localStorage.removeItem("current_user");
        updateProfileButton(null);
      }
    } else {
      updateProfileButton(null);
    }
  }
  checkLoginStatus();
  const cartContainer = document.getElementById("cart-items-container");
  const emptyMessage = document.getElementById("empty-cart-message");
  const totalElement = document.getElementById("cart-total");
  const clearCartBtn = document.getElementById("clear-cart-btn");
  const finalizeBtn = document.querySelector(".btn-primary");

  // --- LISTA DE JOGOS COMPLETA (Mapeamento de ID para LINK) ---
  // Esta lista é essencial para a função Finalizar Compra
  const allGames = [
    // DESTAQUES
    {
      id: "gow-ragnarok",
      link: "https://store.steampowered.com/app/2322010/God_of_War_Ragnark/",
    },
    {
      id: "watch-dogs",
      link: "https://store.steampowered.com/app/243470/Watch_Dogs/",
    },
    {
      id: "ac-valhalla",
      link: "https://store.steampowered.com/app/2208920/Assassins_Creed_Valhalla/",
    },
    {
      id: "far-cry-6",
      link: "https://store.steampowered.com/app/2369390/Far_Cry_6/",
    },
    {
      id: "doom-eternal",
      link: "https://store.steampowered.com/app/782330/DOOM_Eternal/",
    },
    {
      id: "tomb-raider",
      link: "https://store.steampowered.com/app/203160/Tomb_Raider/",
    },
    {
      id: "ac-shadows",
      link: "https://store.steampowered.com/app/3159330/Assassins_Creed_Shadows/",
    },
    {
      id: "capcom-arcade",
      link: "https://store.steampowered.com/app/1556712/Capcom_Arcade_StadiumFINAL_FIGHT/",
    },
    {
      id: "zelda-clone",
      link: "https://steamcommunity.com/sharedfiles/filedetails/?id=1296240737",
    },
    {
      id: "bloodborne",
      link: "https://store.steampowered.com/curator/7870502-BLOODBORNE-PC/?l=portuguese",
    },
    { id: "dark-souls", link: "#" },
    {
      id: "metal-gear",
      link: "https://store.steampowered.com/app/287700/METAL_GEAR_SOLID_V_THE_PHANTOM_PAIN/",
    },

    // LANÇAMENTOS (Adicione aqui os links corretos se houverem, ou mantenha '#')
    { id: "lan-jogo-1", link: "#" },
    { id: "lan-jogo-2", link: "#" },
    { id: "lan-jogo-3", link: "#" },
    { id: "lan-jogo-4", link: "#" },
    { id: "lan-jogo-5", link: "#" },
    { id: "lan-jogo-6", link: "#" },
    { id: "lan-jogo-7", link: "#" },
    { id: "lan-jogo-8", link: "#" },
    { id: "lan-jogo-9", link: "#" },
    { id: "lan-jogo-10", link: "#" },
    { id: "lan-jogo-11", link: "#" },
    { id: "lan-jogo-12", link: "#" },
  ];

  // 1. Função principal para carregar o carrinho
  function renderCart() {
    let cart = JSON.parse(localStorage.getItem("epic_cart")) || [];
    let total = 0;
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
      emptyMessage.style.display = "block";
      totalElement.textContent = "R$ 0,00";
      finalizeBtn.disabled = true;
      return;
    }

    emptyMessage.style.display = "none";
    finalizeBtn.disabled = false;

    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const priceText =
        item.price === 0
          ? "Gratuito"
          : `R$ ${item.price.toFixed(2).replace(".", ",")}`;
      const totalItemText =
        item.price === 0
          ? "Gratuito"
          : `R$ ${itemTotal.toFixed(2).replace(".", ",")}`;

      const itemElement = document.createElement("div");
      itemElement.className = "cart-item";
      itemElement.style.cssText = `
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 0.5fr;
                align-items: center; 
                padding: 15px 0; 
                border-bottom: 1px solid #282828;
                font-size: 0.9em;
            `;

      itemElement.innerHTML = `
                <div style="font-weight: 600;">${item.name}</div>
                <div style="color: var(--cinza-claro);">${priceText}</div>
                <div style="color: var(--laranja-escuro); font-weight: 600;">${totalItemText}</div>
                <button data-id="${item.id}" class="btn-remove-item" style="background: none; border: none; color: var(--vermelho-principal); cursor: pointer; font-size: 1.2em; transition: color 0.2s;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
      cartContainer.appendChild(itemElement);
    });

    totalElement.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;

    document.querySelectorAll(".btn-remove-item").forEach((button) => {
      button.addEventListener("click", removeItem);
    });
  }

  // --- Lógica de Remover, Limpar e Finalizar ---
  function removeItem(e) {
    const itemId = e.currentTarget.getAttribute("data-id");
    let cart = JSON.parse(localStorage.getItem("epic_cart")) || [];
    cart = cart.filter((item) => item.id !== itemId);
    localStorage.setItem("epic_cart", JSON.stringify(cart));
    renderCart();
  }

  clearCartBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja limpar todo o carrinho?")) {
      localStorage.removeItem("epic_cart");
      renderCart();
    }
  });

  finalizeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let cart = JSON.parse(localStorage.getItem("epic_cart")) || [];

    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    // Mapeia os IDs dos jogos no carrinho para seus links originais
    const checkoutLinks = cart
      .map((cartItem) => allGames.find((game) => game.id === cartItem.id))
      .filter((game) => game && game.link && game.link !== "#")
      .map((game) => game.link);

    if (checkoutLinks.length === 0) {
      alert(
        "Nenhum jogo no carrinho possui um link de compra válido. Limpando carrinho..."
      );
    } else {
      // Abre uma nova aba para cada link de compra (simula o checkout)
      checkoutLinks.forEach((link) => {
        // AQUI OCORRE A ABERTURA DE MÚLTIPLAS ABAS
        window.open(link, "_blank");
      });

      alert(
        `Obrigado pela compra! Abrimos ${checkoutLinks.length} abas para você finalizar o pagamento.`
      );
    }

    localStorage.removeItem("epic_cart");
    window.location.reload();
  });

  renderCart();
});
