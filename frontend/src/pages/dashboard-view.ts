import { Router } from "@vaadin/router";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("dashboard-view")
export class DashboardView extends LitElement {
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  // Guard de navigation : s'assure qu'il y a un token valide
  connectedCallback() {
    super.connectedCallback();
    const token = localStorage.getItem("token");
    if (!token) {
      // Pas authentifié : on redirige vers login
      Router.go("/login");
    }
  }

  render() {
    return html`
      <main class="app__main">
        <h1>Bienvenue sur le Dashboard sécurisé !</h1>
        <p>Vous êtes connecté.</p>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dashboard-view": DashboardView;
  }
}
