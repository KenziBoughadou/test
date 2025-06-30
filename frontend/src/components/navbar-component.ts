import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("navbar-component")
export class NavbarComponent extends LitElement {
  createRenderRoot() {
    return this; // light DOM
  }

  // Vérifie la présence du token dans le localStorage
  private isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }

  render() {
    return html`
      <nav class="navbar bg-body-tertiary fixed-top">
        <div class="container-fluid">
          <a class="navbar-brand" href="/">Garage</a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div
            class="offcanvas offcanvas-end"
            tabindex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div class="offcanvas-header">
              <h5 class="offcanvas-title" id="offcanvasNavbarLabel">
                Navigation
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div class="offcanvas-body">
              <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li class="nav-item">
                  <a class="nav-link active" aria-current="page" href="/">Home</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">Contact Us</a>
                </li>
                <!-- Dashboard affiché seulement si connecté -->
                ${this.isAuthenticated() ? html`
                  <li class="nav-item">
                    <a class="nav-link" href="/dashboard">Dashboard</a>
                  </li>
                ` : ''}
                <li class="nav-item dropdown">
                  <a
                    class="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    More
                  </a>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/car-parts">Car Parts</a></li>
                    <li>
                      <a class="dropdown-item" href="/car-tools">Car Tools</a>
                    </li>
                    <li>
                      <hr class="dropdown-divider"/>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#">Legal Information</a>
                    </li>
                  </ul>
                </li>
              </ul>
              <section class="my-3">
                <a href="/login" class="btn btn-outline-success">Log in</a>
                <a href="/signup" class="btn btn-success">Sign up</a>
              </section>
            </div>
          </div>
        </div>
      </nav>
    `;
  }
}

declare global {
    interface HTMLElementTagNameMap {
        "navbar-component": NavbarComponent
    }
}
