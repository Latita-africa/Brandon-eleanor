/* Local stand-in for the Wix form SDK so the invitation page does not crash. */
export const FORM_ERROR = 'FORM_ERROR';

const REQUIRED_TARGETS = [
  'respondent_name',
  'respondent_guest_id',
  'household_id',
  'household_name',
  'household_attendance_json',
  'household_attendance_summary',
  'household_attending_total',
  'household_declining_total',
  'household_note'
];

export function createFormStore() {
  const listeners = new Set();
  const values = Object.create(null);
  let state = {
    loading: false,
    closed: false,
    outcome: null,
    errors: {},
    form: {
      fields: REQUIRED_TARGETS.map(target => ({ target, type: 'text' })),
      disabledMessage: 'RSVP submissions are closed.'
    }
  };

  const emit = () => {
    for (const listener of listeners) {
      try { listener(state); } catch (error) { console.error(error); }
    }
  };

  const setState = patch => {
    state = { ...state, ...patch };
    emit();
  };

  return {
    getState() {
      return state;
    },
    subscribe(listener) {
      if (typeof listener === 'function') listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start() {
      setState({ loading: false, errors: {} });
    },
    stop() {
      listeners.clear();
    },
    setValue(target, value) {
      values[target] = value;
    },
    async submit() {
      setState({ loading: true, errors: {} });
      try {
        // Keep UI usable until a custom RSVP API replaces Wix.
        // Mark as submitted successfully on this device for now.
        await new Promise(resolve => setTimeout(resolve, 250));
        setState({ loading: false, outcome: { ok: true, values: { ...values } } });
        return { ok: true };
      } catch (error) {
        setState({
          loading: false,
          errors: { [FORM_ERROR]: error.message || 'Could not send RSVP.' }
        });
        throw error;
      }
    }
  };
}
