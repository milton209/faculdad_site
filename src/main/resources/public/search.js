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

  const searchInput = document.getElementById("searchInput");
  const gamesResultsContainer = document.getElementById("gamesResults");

  // --- LISTAS DE JOGOS (DADOS COMBINADOS) ---
  // Esta é a lista completa de jogos que a página de pesquisa irá usar.

  const destaqueGames = [
    {
      id: "gow-ragnarok",
      name: "God of War Ragnarök",
      price: 150.0,
      img: "imagens-lancamentos/1.jpg",
      link: "https://store.steampowered.com/app/2322010/God_of_War_Ragnark/",
    },
    {
      id: "watch-dogs",
      name: "Watch Dogs",
      price: 89.9,
      img: "imagens-lancamentos/2.webp",
      link: "https://store.steampowered.com/app/243470/Watch_Dogs/",
    },
    {
      id: "ac-valhalla",
      name: "Assassin's Creed Valhalla",
      price: 100.0,
      img: "imagens-lancamentos/3.jpg",
      link: "https://store.steampowered.com/app/2208920/Assassins_Creed_Valhalla/",
    },
    {
      id: "far-cry-6",
      name: "Far Cry 6",
      price: 80.0,
      img: "imagens-lancamentos/4.jfif",
      link: "https://store.steampowered.com/app/2369390/Far_Cry_6/",
    },
    {
      id: "doom-eternal",
      name: "DOOM Eternal",
      price: 200.0,
      img: "imagens-lancamentos/5.jpg",
      link: "https://store.steampowered.com/app/782330/DOOM_Eternal/",
    },
    {
      id: "tomb-raider",
      name: "Tomb Raider",
      price: 39.99,
      img: "imagens-lancamentos/6.jpg",
      link: "https://store.steampowered.com/app/203160/Tomb_Raider/",
    },
    {
      id: "ac-shadows",
      name: "Assassin's Creed Shadows",
      price: 90.0,
      img: "imagens-lancamentos/7.avif",
      link: "https://store.steampowered.com/app/3159330/Assassins_Creed_Shadows/",
    },
    {
      id: "capcom-arcade",
      name: "Capcom Arcade Stadium",
      price: 120.0,
      img: "imagens-lancamentos/8.jpg",
      link: "https://store.steampowered.com/app/1556712/Capcom_Arcade_StadiumFINAL_FIGHT/",
    },
    {
      id: "zelda-clone",
      name: "Zelda-Like Game",
      price: 0.0,
      img: "imagens-lancamentos/9.png",
      link: "https://steamcommunity.com/sharedfiles/filedetails/?id=1296240737",
    },
    {
      id: "bloodborne",
      name: "Bloodborne PC",
      price: 50.0,
      img: "imagens-lancamentos/10.jpg",
      link: "https://store.steampowered.com/curator/7870502-BLOODBORNE-PC/?l=portuguese",
    },
    {
      id: "dark-souls",
      name: "Dark Souls III",
      price: 180.0,
      img: "imagens-lancamentos/11.jpg",
      link: "https://store.steampowered.com/app/374320/Dark_Souls_III/",
    },
    {
      id: "metal-gear",
      name: "Metal Gear Solid V",
      price: 75.0,
      img: "imagens-lancamentos/12.webp",
      link: "https://store.steampowered.com/app/287700/METAL_GEAR_SOLID_V_THE_PHANTOM_PAIN/",
    },
  ];

  const jogosGratuitos = [
    {
      id: "free-1",
      name: "Apex Legends",
      price: 0.0,
      img: "imagens/1.jfif",
      link: "https://www.ea.com/pt-br/games/apex-legends/free-to-play",
    },
    {
      id: "free-2",
      name: "Fortnite",
      price: 0.0,
      img: "imagens/2.jfif",
      link: "https://www.epicgames.com/fortnite/en-US/home",
    },
    {
      id: "free-3",
      name: "Valorant",
      price: 0.0,
      img: "imagens/3.jpg",
      link: "https://playvalorant.com/pt-br/",
    },
    {
      id: "free-4",
      name: "Genshin Impact",
      price: 0.0,
      img: "imagens/4.jpg",
      link: "https://genshin.hoyoverse.com/pt/home",
    },
    {
      id: "free-5",
      name: "Rocket League",
      price: 0.0,
      img: "imagens/5.jpg",
      link: "https://www.rocketleague.com/",
    },
    {
      id: "free-6",
      name: "Counter-Strike 2",
      price: 0.0,
      img: "imagens/6.jpg",
      link: "https://store.steampowered.com/app/730/CounterStrike_2/",
    },
    {
      id: "free-7",
      name: "Destiny 2",
      price: 0.0,
      img: "imagens/7.webp",
      link: "https://www.bungie.net/7/pt-br/Destiny/NewLight",
    },
    {
      id: "free-8",
      name: "Warframe",
      price: 0.0,
      img: "imagens/8.jpg",
      link: "https://www.warframe.com/",
    },
    {
      id: "free-9",
      name: "Fall Guys",
      price: 0.0,
      img: "imagens/9.webp",
      link: "https://www.fallguys.com/pt-BR",
    },
    {
      id: "free-10",
      name: "Splitgate",
      price: 0.0,
      img: "imagens/1.jfif",
      link: "https://www.splitgate.com/",
    },
    {
      id: "free-11",
      name: "Dota 2",
      price: 0.0,
      img: "imagens/2.jfif",
      link: "https://www.dota2.com/home",
    },
    {
      id: "free-12",
      name: "League of Legends",
      price: 0.0,
      img: "imagens/3.jpg",
      link: "https://www.leagueoflegends.com/pt-br/",
    },
  ];

  const allGamesCombined = [...destaqueGames, ...jogosGratuitos];

  // --- FUNÇÃO DE RENDERIZAÇÃO E BOTÕES ---
  function renderGames(gamesArray, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (gamesArray.length === 0) {
      container.innerHTML =
        '<p style="color: var(--cinza-claro); text-align: center; width: 100%; padding: 50px;">Nenhum jogo encontrado. Tente outra busca.</p>';
      return;
    }

    container.innerHTML = gamesArray
      .map((game) => {
        // Verifica se o jogo é gratuito (preço 0.00)
        const isFree = game.price === 0.0;

        const priceDisplay = isFree
          ? "Gratuito"
          : `R$ ${game.price.toFixed(2).replace(".", ",")}`;

        const buttonContent = isFree
          ? `<a href="${game.link}" target="_blank" class="btn-add-cart btn-download-link">+ Baixar Grátis</a>`
          : `<button class="btn-add-cart" data-id="${game.id}" data-name="${
              game.name
            }" data-price="${game.price.toFixed(2)}">+ Adicionar</button>`;

        return `
                <div class="game-card" style="margin-bottom: 20px;">
                    <div class="placeholder">
                        <a href="${game.link || "#"}">
                            <img src="${game.img}" alt="${
          game.name
        }" style="width: 100%; height: auto; display: block;">
                        </a>
                    </div>
                    <div class="game-info">
                        <h3>${game.name}</h3>
                        <span class="game-price">${priceDisplay}</span>
                        ${buttonContent}
                    </div>
                </div>
            `;
      })
      .join("");

    // Lógica de Adicionar ao Carrinho (APENAS para botões de compra)
    document.querySelectorAll(".btn-add-cart").forEach((button) => {
      if (button.tagName === "BUTTON") {
        button.addEventListener("click", () => {
          const gameData = {
            id: button.getAttribute("data-id"),
            name: button.getAttribute("data-name"),
            price: parseFloat(button.getAttribute("data-price")),
            quantity: 1,
          };

          let cart = JSON.parse(localStorage.getItem("epic_cart")) || [];
          const existingItem = cart.find((i) => i.id === gameData.id);

          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            cart.push(gameData);
          }
          localStorage.setItem("epic_cart", JSON.stringify(cart));

          // Feedback Visual Rápido
          button.textContent = "Adicionado!";
          button.classList.add("added");

          setTimeout(() => {
            button.textContent = "+ Adicionar";
            button.classList.remove("added");
          }, 1500);
        });
      }
    });
  }

  // --- LÓGICA DE PESQUISA ---
  function handleSearch() {
    const query = searchInput.value.toLowerCase();

    const filteredGames = allGamesCombined.filter((game) =>
      game.name.toLowerCase().includes(query)
    );

    // Renderiza os resultados no contêiner da página de pesquisa
    renderGames(filteredGames, "gamesResults");
  }

  // Ouve a digitação do usuário
  searchInput.addEventListener("input", handleSearch);

  // CHAMA A FUNÇÃO PARA EXIBIR TODOS OS JOGOS AO CARREGAR A PÁGINA
  handleSearch();
});
