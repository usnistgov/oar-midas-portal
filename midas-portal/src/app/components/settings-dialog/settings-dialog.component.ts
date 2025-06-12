import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Describes a configurable key and its label */
interface ConfigKey {
  key: string;
  label: string;
}

/** Stored config entry: label + the actual saved value */
interface ConfigEntry {
  label: string;
  value: string;
}

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent {
  /** List of all config fields and how to display them */
  readonly KEYS: ConfigKey[] = [
    { key: 'dmpAPI', label: 'DMP API URL' },
    { key: 'dapAPI', label: 'DAP API URL' },
    { key: 'groupAPI', label: 'Group API URL' },
    { key: 'dmpUI', label: 'DMP UI URL' },
    { key: 'dapUI', label: 'DAP UI URL' },
    { key: 'dmpEDIT', label: 'DMP Edit Base URL' },
    { key: 'dapEDIT', label: 'DAP Edit Base URL' }
  ];

  /** Predefined defaults for easy autofill */
  private readonly DEFAULTS: Record<string, string> = {
    dmpAPI: 'https://mdstest.nist.gov/midas/dmp/mdm1',
    dapAPI: 'https://mdstest.nist.gov/midas/dap/mds3',
    groupAPI: 'https://mdstest.nist.gov/midas/groups',
    dmpUI: 'https://mdstest.nist.gov/dmpui/new',
    dapUI: 'https://mdstest.nist.gov/dapui/new',
    dmpEDIT: 'https://mdstest.nist.gov/dmpui/edit/',
    dapEDIT: 'https://mdstest.nist.gov/dapui/edit/od/id/'
  };

  /** Key for the sidebar lock toggle in localStorage (not used)*/
  readonly LOCK_KEY = 'lockSidebar';

  /** Holds the loaded configuration entries (label + saved value) */
  savedConfig: Record<string, ConfigEntry> = {};

  /** Reactive form backing all controls in the dialog */
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SettingsDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    // Load any previously-saved config from localStorage
    const raw = JSON.parse(localStorage.getItem('appConfig') || '{}');

    // Build a config object and form controls based on KEYS
    const controlsConfig: Record<string, any> = {};
    for (const entry of this.KEYS) {
      // If nothing saved, default to blank
      const savedEntry = raw[entry.key] as ConfigEntry;
      this.savedConfig[entry.key] = savedEntry || { label: entry.label, value: '' };
      controlsConfig[entry.key] = [this.savedConfig[entry.key].value];
    }

    // Add a checkbox for “lock sidebar” using its own key
    controlsConfig[this.LOCK_KEY] = [
      localStorage.getItem('sidenavLocked') === 'true'
    ];

    // Initialize the reactive form with all controls
    this.form = this.fb.group(controlsConfig);
  }

  /** Autofill every field with the predefined DEFAULTS values */
  autofill(): void {
    for (const entry of this.KEYS) {
      this.form.get(entry.key)?.setValue(this.DEFAULTS[entry.key]);
    }
    this.snackBar.open('Defaults loaded', 'Dismiss', { duration: 2000 });
  }

  /** Remove the saved config from storage and reset all form fields */
  clearStorage(): void {
    localStorage.removeItem('appConfig');
    for (const entry of this.KEYS) {
      this.form.get(entry.key)?.setValue('');
    }
    this.snackBar.open('Storage cleared', 'Dismiss', { duration: 2000 });
  }

  /** Persist current form values back into localStorage and close dialog */
  save(): void {
    // Update in-memory config object
    for (const entry of this.KEYS) {
      this.savedConfig[entry.key].value = this.form.get(entry.key)?.value || '';
    }
    // Write the updated config to localStorage
    localStorage.setItem('appConfig', JSON.stringify(this.savedConfig));

    // Persist the sidebar lock toggle as well 
    // (TODO: the logix for this is broken, fix) 
    const locked = this.form.get(this.LOCK_KEY)!.value;
    localStorage.setItem('sidenavLocked', locked ? 'true' : 'false');

    // Feedback and close
    this.snackBar.open('Configuration saved', 'Dismiss', { duration: 2000 });
    this.dialogRef.close({ refresh: true });
  }

  /** Close the dialog without saving */
  close(): void {
    this.dialogRef.close();
  }
}
