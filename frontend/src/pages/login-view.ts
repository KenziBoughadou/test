import { Router } from "@vaadin/router";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("login-view")
export class LoginView extends LitElement {

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

connectedCallback() {
    super.connectedCallback();
    const token = localStorage.getItem("token");
    if (token) {
      Router.go("/dashboard");
    }
  }

  private async _onSubmit(e: Event) {
  e.preventDefault();
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const email = emailInput?.value ?? "";
  const password = passwordInput?.value ?? "";

  const formData = new URLSearchParams();
  formData.append("username", email);      // PAS "email"
  formData.append("password", password);

  try {
    const response = await fetch("http://localhost:8100/api/v1/auth/login", {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = await response.json();
    if (response.ok) {
   // Stocke le token
   localStorage.setItem("token", data.access_token);
   // Afficher un message
   alert("Connexion réussie !");
   window.location.href = "/dashboard";
   // Rediriger vers dashboard
  } else {
  alert("Échec de la connexion : " + (jsResponse.detail || JSON.stringify(jsResponse)));
  }
  } catch (err) {
    alert("Erreur réseau !");
  }
}


  render() {
    return html`
      <main class="app__main login__main">
        <header class="mb-5">
          <h1 style="font-size:20px">Log-in Form</h1>
        </header>
        <form id="login-form" @submit="${this._onSubmit}">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="email" />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" />
          </div>
          <button id="submit-button" type="submit" class="btn btn-primary">Submit</button>
        </form>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "login-view": LoginView;
  }
}