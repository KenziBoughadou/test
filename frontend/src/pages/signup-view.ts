import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";

/**
  estimer l'entropie d'un mot de passe
  On augmente le "charset" selon les types de caractères présents :
  minuscules, majuscules, chiffres, caractères spéciaux.
 */
function estimatePasswordEntropy(password: string): number {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26; // minuscules
  if (/[A-Z]/.test(password)) charsetSize += 26; // majuscules
  if (/[0-9]/.test(password)) charsetSize += 10; // chiffres
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // symboles
  return password.length * Math.log2(charsetSize || 1); // bits d'entropie
}

/**
 Donne un label pédagogique en fonction de l'entropie calculée.
 Tu peux adapter les seuils à ta politique de sécurité.
 */
function getEntropyLabel(entropy: number): string {
  if (entropy < 28) return "Faible 🔴";
  if (entropy < 36) return "Moyen 🟠";
  if (entropy < 60) return "Fort 🟢";
  return "Très fort 💪";
}

@customElement("signup-view")
export class SignupView extends LitElement {
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  @state()
  private passwordStrength: string = "";

  // Vérifie si un champ du formulaire est vide
  private hasNullFieldValue(data: FormData): boolean {
    for (const [_, value] of data.entries()) {
      if (value === null || value === "") {
        return true;
      }
    }
    return false;
  }

  // Met à jour la force du mot de passe en temps réel
  private _onPasswordInput(e: Event) {
    const password = (e.target as HTMLInputElement).value;
    const entropy = estimatePasswordEntropy(password);
    this.passwordStrength = getEntropyLabel(entropy);
  }

  // Gestion de la soumission du formulaire d'inscription
  private async _onSubmit(e: MouseEvent) {
  e.preventDefault();

  const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
  submitButton.disabled = true;

  const formData = new FormData(document.getElementById("signup-form") as HTMLFormElement);

  if (this.hasNullFieldValue(formData)) {
    alert('Fill in the form');
    submitButton.disabled = false;
    return;
  }

  const password = formData.get("password") as string;
  const entropy = estimatePasswordEntropy(password);
  if (entropy < 28) {
    alert('Mot de passe trop faible !');
    submitButton.disabled = false;
    return;
  }

  const requestInit = {
    method: "POST",
    body: formData
  }

  try {
  const serverResponse = await fetch(
    "http://localhost:8100/api/v1/users/create",
    requestInit
  );
  const jsResponse = await serverResponse.json();

  if (serverResponse.status === 409) {
    alert("Cet email est déjà utilisé !");
  } else if (serverResponse.ok) {
    alert("Compte créé avec succès !");
    window.location.href = "/login";
  } else {
    alert("Erreur lors de la création du compte : " + (jsResponse.detail || JSON.stringify(jsResponse)));
  }
} catch (err) {
  alert("Erreur réseau ou serveur !");
} finally {
  submitButton.disabled = false;
}
}


  render() {
    return html`
      <main class="app__main signup__main">
        <header class="mb-5">
          <h1 style="font-size:20px">Sign-up Form</h1>
        </header>

        <form
          id="signup-form"
          @submit="${this._onSubmit}"
          enctype="multipart/form-data"
        >
          <div class="mb-3">
            <label for="firstname" class="form-label">Firstname</label>
            <input
              type="text"
              class="form-control"
              name="firstname"
              id="firstname"
            />
          </div>
          <div class="mb-3">
            <label for="lastname" class="form-label">Lastname</label>
            <input
              type="text"
              class="form-control"
              name="lastname"
              id="lastname"
            />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" name="email" id="email" />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              name="password"
              id="password"
              @input="${this._onPasswordInput}"
            />
            <div>
              <small>
                Niveau de sécurité :
                <strong>${this.passwordStrength}</strong>
              </small>
            </div>
          </div>
          <div class="mb-3">
            <label for="photo" class="form-label">Photo</label>
            <input class="form-control" type="file" name="photo" id="photo" />
          </div>
          <button id="submit-button" type="submit" class="btn btn-primary">
            Submit
          </button>
        </form>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "signup-view": SignupView;
  }
}
