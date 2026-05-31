/* =========================================
   GLOBAL APP JS
========================================= */

const API_URL =
  "http://localhost:5000/api";

/* =========================================
   TOKEN + USER
========================================= */

const token =
  localStorage.getItem(
    "token"
  );

const user =
  JSON.parse(
    localStorage.getItem(
      "user"
    )
  );

/* =========================================
   GLOBAL HEADERS
========================================= */

const authHeaders = {

  "Content-Type":
    "application/json",

  Authorization:
    `Bearer ${token}`,

};

/* =========================================
   CHECK AUTH
========================================= */

function checkAuth() {

  if (!token) {

    window.location.href =
      "login.html";

  }

}

/* =========================================
   GET USER ROLE
========================================= */

function getUserRole() {

  if (!user) {

    return null;

  }

  return user.role;

}

/* =========================================
   REDIRECT BASED ON ROLE
========================================= */

function redirectDashboard() {

  const role =
    getUserRole();

  if (
    role === "admin"
  ) {

    window.location.href =
      "admin.html";

  } else if (
    role === "officer"
  ) {

    window.location.href =
      "officer.html";

  } else {

    window.location.href =
      "citizen.html";

  }

}

/* =========================================
   LOGIN USER
========================================= */

async function loginUser() {

  try {

    const email =
      document.getElementById(
        "email"
      ).value;

    const password =
      document.getElementById(
        "password"
      ).value;

    if (
      !email ||
      !password
    ) {

      showToast(
        "Please fill all fields",
        "danger"
      );

      return;

    }

    const res =
      await fetch(

        `${API_URL}/auth/login`,

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            email,
            password,

          }),

        }

      );

    const data =
      await res.json();

    if (data.success) {

      localStorage.setItem(

        "token",

        data.token

      );

      localStorage.setItem(

        "user",

        JSON.stringify(
          data.user
        )

      );

      showToast(
        "Login Successful",
        "success"
      );

      setTimeout(() => {

        redirectDashboard();

      }, 1000);

    } else {

      showToast(
        data.message,
        "danger"
      );

    }

  } catch (error) {

    console.log(error);

    showToast(
      "Server Error",
      "danger"
    );

  }

}

/* =========================================
   REGISTER USER
========================================= */

async function registerUser() {

  try {

    const name =
      document.getElementById(
        "name"
      ).value;

    const email =
      document.getElementById(
        "email"
      ).value;

    const password =
      document.getElementById(
        "password"
      ).value;

    const role =
      document.getElementById(
        "role"
      ).value;

    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {

      showToast(
        "Please fill all fields",
        "danger"
      );

      return;

    }

    const res =
      await fetch(

        `${API_URL}/auth/register`,

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            name,
            email,
            password,
            role,

          }),

        }

      );

    const data =
      await res.json();

    if (data.success) {

      showToast(
        "Registration Successful",
        "success"
      );

      setTimeout(() => {

        window.location.href =
          "login.html";

      }, 1500);

    } else {

      showToast(
        data.message,
        "danger"
      );

    }

  } catch (error) {

    console.log(error);

    showToast(
      "Server Error",
      "danger"
    );

  }

}

/* =========================================
   LOGOUT
========================================= */

function logout() {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "user"
  );

  showToast(
    "Logged Out",
    "info"
  );

  setTimeout(() => {

    window.location.href =
      "login.html";

  }, 1000);

}

/* =========================================
   SHOW TOAST
========================================= */

function showToast(
  message,
  type = "info"
) {

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    `toast ${type}`;

  toast.innerHTML = `

    <div class="toast-body">

      ${message}

    </div>

  `;

  document.body.appendChild(
    toast
  );

  setTimeout(() => {

    toast.classList.add(
      "show"
    );

  }, 100);

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

    setTimeout(() => {

      toast.remove();

    }, 300);

  }, 3000);

}

/* =========================================
   LOADER
========================================= */

function showLoader() {

  const loader =
    document.getElementById(
      "loader"
    );

  if (loader) {

    loader.style.display =
      "flex";

  }

}

function hideLoader() {

  const loader =
    document.getElementById(
      "loader"
    );

  if (loader) {

    loader.style.display =
      "none";

  }

}

/* =========================================
   FETCH USER PROFILE
========================================= */

async function fetchProfile() {

  try {

    const res =
      await fetch(

        `${API_URL}/auth/profile`,

        {

          headers:
            authHeaders,

        }

      );

    const data =
      await res.json();

    if (data.success) {

      const profile =
        data.user;

      const profileName =
        document.getElementById(
          "profileName"
        );

      const profileRole =
        document.getElementById(
          "profileRole"
        );

      if (profileName) {

        profileName.innerText =
          profile.name;

      }

      if (profileRole) {

        profileRole.innerText =
          profile.role;

      }

    }

  } catch (error) {

    console.log(error);

  }

}

/* =========================================
   FORMAT DATE
========================================= */

function formatDate(
  date
) {

  return new Date(
    date
  ).toLocaleString();

}

/* =========================================
   SEARCH FILTER
========================================= */

function filterCards(
  inputId,
  containerId,
  cardClass
) {

  const input =
    document.getElementById(
      inputId
    );

  const filter =
    input.value
    .toLowerCase();

  const container =
    document.getElementById(
      containerId
    );

  const cards =
    container.getElementsByClassName(
      cardClass
    );

  Array.from(cards)
  .forEach(card => {

    const text =
      card.innerText
      .toLowerCase();

    if (
      text.includes(
        filter
      )
    ) {

      card.style.display =
        "block";

    } else {

      card.style.display =
        "none";

    }

  });

}

/* =========================================
   COPY TEXT
========================================= */

function copyText(
  text
) {

  navigator.clipboard
    .writeText(text)
    .then(() => {

      showToast(
        "Copied",
        "success"
      );

    });

}

/* =========================================
   EXPORT JSON
========================================= */

function exportJSON(
  data,
  filename
) {

  const blob =
    new Blob(

      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],

      {

        type:
          "application/json"

      }

    );

  const url =
    URL.createObjectURL(
      blob
    );

  const a =
    document.createElement(
      "a"
    );

  a.href = url;

  a.download =
    filename;

  a.click();

}

/* =========================================
   AUTO ROLE GUARD
========================================= */

window.addEventListener(
  "load",
  () => {

    const page =
      window.location.pathname;

    const role =
      getUserRole();

    if (
      page.includes(
        "admin"
      ) &&
      role !== "admin"
    ) {

      window.location.href =
        "login.html";

    }

    if (
      page.includes(
        "officer"
      ) &&
      role !== "officer"
    ) {

      window.location.href =
        "login.html";

    }

    if (
      page.includes(
        "citizen"
      ) &&
      role !== "citizen"
    ) {

      window.location.href =
        "login.html";

    }

  }
);

/* =========================================
   NETWORK STATUS
========================================= */

window.addEventListener(
  "offline",
  () => {

    showToast(
      "Internet Disconnected",
      "danger"
    );

  }
);

window.addEventListener(
  "online",
  () => {

    showToast(
      "Internet Connected",
      "success"
    );

  }
);

/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
  str
) {

  return str
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}

/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

window.onerror =
  function (
    message,
    source,
    lineno
  ) {

    console.log(

      "Global Error:",

      message,

      source,

      lineno

    );

  };