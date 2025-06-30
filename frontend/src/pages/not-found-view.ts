import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js";


@customElement('not-found-view')
export class NotFoundView extends LitElement {


    render () {
        return html `
        
            <main>
                <h1>404</h1>
            </main>
        
        `
    }
}


declare global {
    interface HTMLElementTagNameMap {
        "not-found-view": NotFoundView
    }
}