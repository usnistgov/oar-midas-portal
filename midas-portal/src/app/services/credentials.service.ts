import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CredentialsService {
  /**
     * Internal signal holding the full credentials object or null.
     */
  private _creds = signal<{
    userId: string;
    userAttributes: Record<string, any>;
    token: string;
  } | null>(null);

  /**
   * Sets the entire credentials object at once.
   * @param creds The credentials returned from login.
   */
  setCreds(creds: { userId: string; userAttributes: Record<string, any>; token: string }) {
    this._creds.set(creds);
  }
  
  /**
   * Clears all stored credentials.
   */
  clear() {
    this._creds.set(null);
  }

  /**
   * Computed read-only signal for the full credentials object.
   */
  readonly credentials = computed(() => this._creds());

  /**
   * Computed read-only signal for the JWT token, or null if unset.
   */
  readonly token = computed(() => this._creds()?.token ?? null);

  /**
   * Computed read-only signal for the userId, or null if unset.
   */
  readonly userId = computed(() => this._creds()?.userId ?? null);

  /**
   * Computed read-only signal for userAttributes, or null if unset.
   */
  readonly userAttributes = computed(() => this._creds()?.userAttributes ?? null);
}
