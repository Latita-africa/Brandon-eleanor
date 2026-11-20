/* Stub: Wix form SDK is not bundled in this custom host build. */
export const FORM_ERROR = 'FORM_ERROR';

export function createFormStore() {
  return {
    async submit() {
      throw new Error('RSVP form storage is not connected on this host yet.');
    }
  };
}
