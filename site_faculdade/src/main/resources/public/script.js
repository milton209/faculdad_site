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

  // ======================================================
  // MÓDULO 2: CARROSSEL DE PÔSTERES
  // ======================================================
  const mainPosters = document.querySelectorAll(".main-poster");
  const sidePosters = document.querySelectorAll(".side-poster");
  let currentIndex = 0;
  let posterInterval;
  if (mainPosters.length > 0 && sidePosters.length === mainPosters.length) {
    const changePoster = (index) => {
      if (index < 0 || index >= mainPosters.length) return;
      mainPosters.forEach((poster) => poster.classList.remove("active"));
      sidePosters.forEach((poster) => poster.classList.remove("active"));
      mainPosters[index].classList.add("active");
      sidePosters[index].classList.add("active");
      currentIndex = index;
    };
    sidePosters.forEach((poster) => {
      poster.addEventListener("click", () => {
        const index = parseInt(poster.dataset.index);
        if (!isNaN(index)) {
          changePoster(index);
          resetPosterInterval();
        }
      });
    });
    const autoChangePoster = () => {
      const nextIndex = (currentIndex + 1) % mainPosters.length;
      changePoster(nextIndex);
    };
    const resetPosterInterval = () => {
      clearInterval(posterInterval);
      if (mainPosters.length > 1) {
        posterInterval = setInterval(autoChangePoster, 5000);
      }
    };
    resetPosterInterval();
    changePoster(0);
  } else if (mainPosters.length > 0) {
    mainPosters[0].classList.add("active");
    console.warn(
      "Número de mainPosters e sidePosters não coincide ou sidePosters ausentes."
    );
  }

  // ======================================================
  // MÓDULO 3: LISTAS DE JOGOS E CARRINHO (COM TRAILER IDs)
  // ======================================================
  const destaqueGames = [
    {
      id: "gow-ragnarok",
      name: "God of War Ragnarök",
      price: 150.0,
      img: "imagens-lancamentos/1.jpg",
      link: "https://store.steampowered.com/app/2322010/God_of_War_Ragnark/",
      trailerId: "gqciogn3sUc",
    },
    {
      id: "watch-dogs",
      name: "Watch Dogs",
      price: 89.9,
      img: "imagens-lancamentos/2.webp",
      link: "https://store.steampowered.com/app/243470/Watch_Dogs/",
      trailerId: "5Wn8gZmHPms",
    },
    {
      id: "ac-valhalla",
      name: "Assassin's Creed Valhalla",
      price: 100.0,
      img: "imagens-lancamentos/3.jpg",
      link: "https://store.steampowered.com/app/2208920/Assassins_Creed_Valhalla/",
      trailerId: "TUbgBVTD7VI",
    },
    {
      id: "far-cry-6",
      name: "Far Cry 6",
      price: 80.0,
      img: "imagens-lancamentos/4.jfif",
      link: "https://store.steampowered.com/app/2369390/Far_Cry_6/",
      trailerId: "-IJuKT1mHO8",
    },
    {
      id: "doom-eternal",
      name: "DOOM Eternal",
      price: 200.0,
      img: "imagens-lancamentos/5.jpg",
      link: "https://store.steampowered.com/app/782330/DOOM_Eternal/",
      trailerId: "_UuktemkCFI",
    },
    {
      id: "tomb-raider",
      name: "Tomb Raider",
      price: 39.99,
      img: "imagens-lancamentos/6.jpg",
      link: "https://store.steampowered.com/app/203160/Tomb_Raider/",
      trailerId: "XYtyeqVQnRI",
    },
    {
      id: "ac-shadows",
      name: "Assassin's Creed Shadows",
      price: 90.0,
      img: "imagens-lancamentos/7.avif",
      link: "https://store.steampowered.com/app/3159330/Assassins_Creed_Shadows/",
      trailerId: "vovkzbtYBC8",
    },
    {
      id: "capcom-arcade",
      name: "Capcom Arcade Stadium",
      price: 120.0,
      img: "imagens-lancamentos/8.jpg",
      link: "https://store.steampowered.com/app/1515950/Capcom_Arcade_Stadium/",
      trailerId: "-7qiuHVVmjA",
    },
    {
      id: "zelda-clone",
      name: "Zelda-Like Game",
      price: 0.0,
      img: "imagens-lancamentos/9.png",
      link: "https://www.nintendo.com/pt-br/store/games/zelda-games/#sort=df&p=0",
      trailerId: "uHGShqcAHlQ",
    },
    {
      id: "elden-ring",
      name: "Elden Ring",
      price: 50.0,
      img: "imagens-lancamentos/10.jpg",
      link: "https://store.steampowered.com/app/1245620/ELDEN_RING/",
      trailerId: "G203e1HhixY",
    },
  ];
  const jogosGratuitos = [
    {
      id: "free-1",
      name: "Apex Legends",
      price: 0.0,
      img: "imagens-lancamentos/Apex_legends_capa.jpg",
      link: "https://store.steampowered.com/app/1172470/Apex_Legends/",
      trailerId: "MCncFxqJv3c",
    },
    {
      id: "free-2",
      name: "Fortnite",
      price: 0.0,
      img: "imagens-lancamentos/fortinite capa.jpg",
      link: "https://www.fortnite.com/?lang=pt-BR",
      trailerId: "nNtboNTpQDQ",
    },
    {
      id: "free-3",
      name: "Valorant",
      price: 0.0,
      img: "imagens-lancamentos/9316-valorant-pc-capa-1.jpg",
      link: "https://playvalorant.com/pt-br/?gclsrc=aw.ds&gad_source=1&gad_campaignid=10161918620&gbraid=0AAAAADidvFxwfgSiZqUQHmnJNMM2osw9-&gclid=CjwKCAjwgeLHBhBuEiwAL5gNEUGMlidKb2VcJlY_pbhNsSXcDwstCYUteFSV9-FQo5CdBC7J2Coy_xoCi6kQAvD_BwE",
      trailerId: "h1Kp9x_ADZw",
    },
    {
      id: "free-4",
      name: "Genshin Impact",
      price: 0.0,
      img: "imagens-lancamentos/genshin.jpg",
      link: "https://act.hoyoverse.com/puzzle/hk4e/pz_DvjBejelna/index.html?lp=GI05&utm_source=LA_google_LA_search_natlan505&hoyotrace_channel=ga_channel&gad_source=1&gad_campaignid=19624069103&gbraid=0AAAAABgn-bpxgOPSbHP7k4KKPw7L76a8m&gclid=CjwKCAjwgeLHBhBuEiwAL5gNEcXQzNlzT2Sfc6WC8zdEfRMBaI8UkiMpUe5at2DW_W22riShLunygRoCnAcQAvD_BwE",
      trailerId: "w50jW_iEXns",
    },
    {
      id: "free-5",
      name: "Rocket League",
      price: 0.0,
      img: "imagens-lancamentos/Rocket_League.jpg",
      link: "https://store.epicgames.com/pt-BR/p/rocket-league",
      trailerId: "OmMF9EDbmQQ",
    },
    {
      id: "free-6",
      name: "Counter-Strike 2",
      price: 0.0,
      img: "imagens-lancamentos/counter-strike-2-cover.png",
      link: "https://store.steampowered.com/app/730/CounterStrike_2/",
    },
    {
      id: "free-7",
      name: "Destiny 2",
      price: 0.0,
      img: "imagens-lancamentos/Destiny_2_capa.jpg",
      link: "https://www.bungie.net/7/pt-br/Destiny/NewLight",
    },
    {
      id: "free-8",
      name: "Warframe",
      price: 0.0,
      img: "imagens-lancamentos/warframe capa.webp",
      link: "https://www.warframe.com/",
    },
    {
      id: "free-9",
      name: "Fall Guys",
      price: 0.0,
      img: "imagens-lancamentos/fall guys.jfif",
      link: "https://www.fallguys.com/pt-BR",
    },
    {
      id: "free-10",
      name: "Splitgate",
      price: 0.0,
      img: "imagens-lancamentos/splitgate-2-1szoj.png",
      link: "https://www.splitgate.com/",
    },
    {
      id: "free-11",
      name: "Dota 2",
      price: 0.0,
      img: "imagens-lancamentos/dota-2-capa.webp",
      link: "https://www.dota2.com/home",
    },
    {
      id: "free-12",
      name: "League of Legends",
      price: 0.0,
      img: "imagens-lancamentos/lol capa.jpg",
      link: "https://www.leagueoflegends.com/pt-br/",
    },
  ];

  // Função renderGames (NÃO adiciona mais listeners de vídeo aqui)
  function renderGames(gamesArray, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container com ID '${containerId}' não encontrado.`);
      return;
    }
    container.innerHTML = gamesArray
      .map((game) => {
        const isFree = game.price === 0.0;
        const buttonContent = isFree
          ? `<a href="${
              game.link || "#"
            }" target="_blank" class="btn-download-link">+ Baixar Grátis</a>`
          : `<button class="btn-add-cart" data-id="${
              game.id || ""
            }" data-name="${game.name || "Jogo"}" data-price="${(
              game.price || 0
            ).toFixed(2)}">+ Adicionar</button>`;
        const trailerButton = game.trailerId
          ? `<button class="btn-play-trailer btn-open-trailer" data-video-id="${game.trailerId}"><i class="fas fa-play"></i></button>`
          : "";
        const imageSrc =
          game.img ||
          "https://via.placeholder.com/280x300/1a1a1a/888?text=Sem+Imagem";
        const gameName = game.name || "Nome Indisponível";
        const gameLink = game.link || "#";
        return `
                <div class="game-card">
                    <div class="placeholder">
                        ${trailerButton}
                        <a href="${gameLink}">
                            <img src="${imageSrc}" alt="${gameName}" style="width: 100%; height: auto; display: block;" onerror="this.src='https://via.placeholder.com/280x300/1a1a1a/888?text=Erro+Img';">
                        </a>
                    </div>
                    <div class="game-info">
                        <h3>${gameName}</h3>
                        <span class="game-price">${
                          isFree
                            ? "Gratuito"
                            : `R$ ${(game.price || 0)
                                .toFixed(2)
                                .replace(".", ",")}`
                        }</span>
                        ${buttonContent}
                    </div>
                </div>
            `;
      })
      .join("");

    // Lógica de Adicionar ao Carrinho (Anexada ao container específico)
    // Lógica de Adicionar ao Carrinho (Anexada ao container específico)
    container.querySelectorAll(".btn-add-cart").forEach((button) => {
      // Apenas botões de "Adicionar" (ignora links de "Baixar")
      if (button.tagName === "BUTTON") {
        button.addEventListener("click", () => {
          const gameData = {
            id: button.getAttribute("data-id"),
            name: button.getAttribute("data-name"),
            price: parseFloat(button.getAttribute("data-price")),
            quantity: 1,
          };
          if (!gameData.id) return;
          let cart = JSON.parse(localStorage.getItem("epic_cart")) || [];
          const existingItemIndex = cart.findIndex((i) => i.id === gameData.id);
          if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity =
              (cart[existingItemIndex].quantity || 0) + 1;
          } else {
            cart.push(gameData);
          }
          localStorage.setItem("epic_cart", JSON.stringify(cart));
          button.textContent = "Adicionado!";
          button.classList.add("added");
          setTimeout(() => {
            if (button) {
              button.textContent = "+ Adicionar";
              button.classList.remove("added");
            }
          }, 1500);
        });
      }
    });
    container.querySelectorAll(".btn-download-link").forEach((link) => {
      link.classList.add("btn-add-cart");
    });
  }
  // Renderiza os jogos primeiro
  renderGames(destaqueGames, "destaque-games-grid");
  renderGames(jogosGratuitos, "lancamentos-games-grid");

  // ======================================================
  // MÓDULO 4: CARROSSEL DE JOGOS (Funcional)
  // ======================================================
  const gameSections = document.querySelectorAll(".games-section");
  gameSections.forEach((section) => {
    const wrapper = section.querySelector(".carousel-wrapper");
    const prevBtn = section.querySelector(".nav-btn.prev");
    const nextBtn = section.querySelector(".nav-btn.next");
    if (wrapper && prevBtn && nextBtn) {
      nextBtn.addEventListener("click", () => {
        const card = wrapper.querySelector(".game-card");
        const scrollAmount = card ? card.offsetWidth + 30 : 310;
        wrapper.scrollBy({ left: scrollAmount, behavior: "smooth" });
      });
      prevBtn.addEventListener("click", () => {
        const card = wrapper.querySelector(".game-card");
        const scrollAmount = card ? card.offsetWidth + 30 : 310;
        wrapper.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      });
    }
  });

  // ======================================================
  // MÓDULO 5: LÓGICA DO MODAL DE VÍDEO (PARA CARDS - TESTE FINAL)
  // ======================================================
  const videoModal = document.getElementById("video-modal");
  const videoCloseBtn = videoModal
    ? videoModal.querySelector(".video-modal-close")
    : null;
  const videoIframe = document.getElementById("video-player-iframe");
  const youtubeBaseURL = "https://www.youtube.com/embed/";

  // --- Verificação inicial ---
  if (!videoModal)
    console.error("Erro Fatal: Elemento #video-modal não encontrado!");
  if (!videoCloseBtn && videoModal)
    console.warn("Aviso: Elemento .video-modal-close não encontrado!");
  if (!videoIframe)
    console.error("Erro Fatal: Elemento #video-player-iframe não encontrado!");

  function openVideoModal(videoId) {
    if (!videoModal || !videoIframe) {
      console.error("Erro ao abrir: Modal ou Iframe não estão disponíveis.");
      return;
    }
    console.log(`[TESTE] Tentando abrir modal com videoId: ${videoId}`); // Log extra

    // *** MUDANÇA PRINCIPAL: URL Simplificada ***
    // *** MUDANÇA CORRIGIDA: Adiciona autoplay e mute ***
    const videoSrc = `${youtubeBaseURL}${videoId}?autoplay=1&mute=1&rel=0`;
    console.log(`[TESTE] Definindo iframe src para: ${videoSrc}`); // Log extra

    videoIframe.src = videoSrc;
    videoModal.classList.add("show");
    console.log("[TESTE] Classe 'show' adicionada ao modal.");
  }

  function closeVideoModal() {
    if (!videoModal || !videoIframe) return;
    console.log("[TESTE] Fechando modal.");
    videoModal.classList.remove("show");
    videoIframe.src = ""; // Para o vídeo ao fechar
  }

  // --- Ouvintes de Fechar ---
  if (videoCloseBtn) {
    videoCloseBtn.removeEventListener("click", closeVideoModal); // Garante listener único
    videoCloseBtn.addEventListener("click", closeVideoModal);
  }
  if (videoModal) {
    // Função auxiliar para fechar ao clicar fora
    const closeModalOnClickOutside = (event) => {
      if (event.target === videoModal) {
        closeVideoModal();
      }
    };
    videoModal.removeEventListener("click", closeModalOnClickOutside); // Garante listener único
    videoModal.addEventListener("click", closeModalOnClickOutside);
  }

  // --- Listener de Clique Simplificado (APENAS para botões .btn-open-trailer) ---
  // --- Listener de Clique Simplificado (APENAS para botões .btn-open-trailer) ---
  console.log(
    "[TESTE] Adicionando listener de clique para .btn-open-trailer nos cards."
  );
  function addCardVideoListeners() {
    const cardPlayButtons = document.querySelectorAll(".btn-open-trailer");
    console.log(
      `[TESTE] Encontrados ${cardPlayButtons.length} botões de play nos cards.`
    );

    cardPlayButtons.forEach((button) => {
      // Adiciona o listener diretamente, sem clonar
      button.addEventListener("click", (event) => {
        event.preventDefault(); // Impede qualquer ação padrão do botão
        const videoId = button.dataset.videoId; // Usa 'button' em vez de 'newButton'
        console.log(
          `[TESTE] Botão CARD clicado. VideoId do dataset: ${videoId}`
        );

        if (videoId) {
          openVideoModal(videoId);
        } else {
          console.warn(
            '[TESTE] Botão card clicado, mas o atributo "data-video-id" está faltando ou vazio.'
          );
        }
      });
    });
  }

  // Chama a função para adicionar os listeners DEPOIS que os jogos foram renderizados
  // (Garante que os botões já existem no DOM)
  addCardVideoListeners();

  // === FIM MÓDULO 5 ===

  // }); // Fechamento do DOMContentLoaded (não incluir esta linha ao copiar só o módulo 5)
});
