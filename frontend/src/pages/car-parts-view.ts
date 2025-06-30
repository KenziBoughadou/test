import { LitElement, html, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

@customElement("car-parts-view")
export class CarPartsView extends LitElement {
  @state()
  data = null;

  @state()
  error = null;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  async firstUpdated(_changedProperties: PropertyValues) {
    try {
      const response = await fetch("../../data/cart-parts.json");
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      this.data = await response.json();
      console.log(this.data);
    } catch (err: any) {
      this.error = err.message;
    }
  }
render() {
  if (!this.data) {
    return html`
      <main class="app__main tools__main">
        <div class="d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </main>
    `;
  }

  return html`
    <main class="app__main tools__main">
      <ul class="row list-unstyled px-2">
        ${repeat(
          this.data!,
          (item: any) => item.id,
          (item) => html`
            <li class="col-12 col-md-6 col-lg-4 my-2">
              <div class="card h-100">
                <img
                  src="${item.image_url}"
                  class="card-img-top"
                  alt="..."
                />
                <div class="card-body">
                  <h5 class="card-title">${item.name}</h5>
                  <p class="card-text">
                    ${item.description}
                  </p>
                  <p class="card-text">${item.price} $</p>
                  <a href="#" class="btn btn-primary">Get it</a>
                </div>
              </div>
            </li>
          `
        )}
      </ul>
    </main>
  `;
}

}

declare global {
  interface HTMLElementTagNameMap {
    "car-parts-view": CarPartsView;
  }
}