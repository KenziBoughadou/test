import { Router } from "@vaadin/router";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("dashboard-view")
export class DashboardView extends LitElement {
  static styles = css`
    .dashboard-container {
      max-width: 500px;
      margin: 4rem auto 0 auto;
      background: #f6f8fa;
      box-shadow: 0 8px 32px rgba(40,40,60,0.1);
      border-radius: 16px;
      padding: 2rem 2.5rem;
      text-align: center;
    }
    .garage-logo {
      font-family: 'Russo One', 'Arial Black', Arial, sans-serif;
      letter-spacing: 2px;
      font-size: 2.3rem;
      color: #244b80;
      margin-bottom: 1rem;
      text-shadow: 0 2px 2px #ccc;
    }
    .user-info-list {
      text-align: left;
      margin: 2rem 0 2.5rem 0;
      font-size: 1.1rem;
    }
    .user-info-list strong {
      width: 110px;
      display: inline-block;
      color: #5a5a5a;
    }
    .logout-btn {
      margin-top: 1.5rem;
      width: 100%;
      padding: 0.8rem 0;
      font-size: 1.1rem;
      background: linear-gradient(90deg, #244b80 0%, #356fa0 100%);
      border: none;
      color: #fff;
      border-radius: 8px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(50,60,100,0.1);
      cursor: pointer;
      transition: background 0.2s;
    }
    .logout-btn:hover {
      background: linear-gradient(90deg, #356fa0 0%, #244b80 100%);
    }
    @media (max-width: 600px) {
      .dashboard-container {
        padding: 1rem 0.7rem;
      }
      .garage-logo { font-size: 1.5rem; }
    }
  `;

  @state()
  user: any = null;

  // SUPPRIME (ou COMENTE) cette fonction :
  // protected createRenderRoot(): HTMLElement | DocumentFragment {
  //   return this;
  // }

  connectedCallback() {
    super.connectedCallback();
    const token = localStorage.getItem("token");
    if (!token) {
      Router.go("/login");
      return;
    }
    fetch("http://localhost:8100/api/v1/users/me", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Token invalide");
      })
      .then((data) => {
        this.user = data;
      })
      .catch(() => {
        localStorage.removeItem("token");
        Router.go("/login");
      });
  }

  deconnexion() {
    localStorage.removeItem("token");
    Router.go("/login");
  }

  render() {
    if (!this.user) {
      return html`
        <div class="dashboard-container">
          <div class="garage-logo">Garage</div>
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
      `;
    }
    return html`
      <div class="dashboard-container">
        <div class="garage-logo">
          <i class="bi bi-tools"></i> Garage Dashboard
        </div>
        <div class="user-info-list">
          <div><strong>Email :</strong> ${this.user.email}</div>
          <div><strong>Prénom :</strong> ${this.user.firstname}</div>
          <div><strong>Nom :</strong> ${this.user.lastname}</div>
          <div><strong>Rôle :</strong> ${this.user.role}</div>
        </div>
        <button @click="${this.deconnexion}" class="logout-btn">
          <i class="bi bi-box-arrow-right"></i> Déconnexion
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dashboard-view": DashboardView;
  }
}