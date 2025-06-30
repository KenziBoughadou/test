import { Router } from "@vaadin/router";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("login-view")
export class LoginView extends LitElement {

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  private async _onSubmit(e: Event) {
    e.preventDefault();
    const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
    submitButton.disabled = true;

    const email = (document.querySelector('#email') as HTMLInputElement).value;
    const password = (document.querySelector('#password') as HTMLInputElement).value;

    if (!(email && password)) {
      alert('Fill in the form');
      submitButton.disabled = false;
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const jsResponse = await response.json();

      if (!jsResponse.token) {
        alert('Failed to log in');
        submitButton.disabled = false;
      } else {

        localStorage.setItem('token', jsResponse.token);
        Router.go('/dashboard')
      }

    } catch (err) {
      console.error('Erreur lors de la requête:', err);
      submitButton.disabled = false;
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