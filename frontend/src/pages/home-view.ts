import { Router } from "@vaadin/router";
import { LitElement, html} from "lit";
import { customElement } from "lit/decorators.js";

@customElement("home-view")
export class HomeView extends LitElement {
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  private _increment(e: Event) {
    Router.go("/");
  }
  // static styles = css`
  //     :host {
  //         display: flex;
  //         flex-direction: column;
  //         align-items: center;
  //         justify-content: center;
  //         min-height: 100vh;
  //         padding-top: 10vh;
  //     }
  // `;

  render() {
    return html`
      <main class="app__main home__main">
        <section class="home__hero-section">
          <figure>
            <img
              src="https://images.pexels.com/photos/4488660/pexels-photo-4488660.jpeg"
              alt=""
            />
          </figure>
          <section></section>
        </section>
        <section class="d-flex flex-row mx-2">
          <div class="card w-75 mb-3 mx-2">
            <div class="card-body">
              <h5 class="card-title">Our Tools</h5>
              <p class="card-text">
               Your one-stop shop for car maintenance and performance upgrades.
              </p>
              <a href="/car-tools" class="btn btn-primary">See our tools</a>
            </div>
          </div>

          <div class="card w-75 mb-3 mx-2">
            <div class="card-body">
              <h5 class="card-title">Our Car Parts</h5>
              <p class="card-text">
               High-performance parts for every make and model.
              </p>
              <a href="/car-parts" class="btn btn-primary">See our cart parts</a>
            </div>
          </div>
        </section>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "home-view": HomeView;
  }
}