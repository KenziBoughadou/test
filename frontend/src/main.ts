import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { Router } from "@vaadin/router";

import "./components/navbar-component";
import "./pages/home-view";
import "./pages/login-view";
import "./pages/not-found-view";
import "./pages/signup-view";
import "./pages/tools-view";
import "./pages/car-parts-view";
import "./pages/dashboard-view"; // AJOUT IMPORTANT

@customElement("app-index")
export class AppIndex extends LitElement {
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    const router = new Router(this.querySelector("#outlet")!);
    router.setRoutes([
      { path: "/", component: "home-view" },
      { path: "/login", component: "login-view" },
      { path: "/signup", component: "signup-view" },
      { path: "/car-tools", component: "tools-view"},
      { path: "/car-parts", component: "car-parts-view"},
      { path: "/dashboard", component: "dashboard-view"}, // AJOUT
      { path: "(.*)", redirect: "/not-found-view" },
    ]);
  }

  render() {
    return html`
      <navbar-component></navbar-component>
      <div id="outlet"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-index": AppIndex;
  }
}
