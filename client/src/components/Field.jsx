// Label, control and error message wired together for assistive tech.
// The child is a render function that receives the id and ARIA attributes.
export default function Field({ id, label, optional, error, children }) {
  const errorId = `${id}-erreur`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.9375rem] font-medium">
        {label}
        {optional && <span className="font-normal text-ardoise"> ({optional})</span>}
      </label>
      {children({
        id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="mt-1.5 text-[0.875rem] text-soldes">
          {error}
        </p>
      )}
    </div>
  );
}

// Maps an API failure onto per-field messages plus one summary line.
export function describeFailure(err, t, fieldMessages) {
  if (err.code === 'validation' && err.fields) {
    const fields = {};
    for (const name of Object.keys(err.fields)) {
      fields[name] = fieldMessages[name]?.(err.fields[name]) ?? t('errors.validation');
    }
    return { fields, summary: t('errors.validation') };
  }
  // The server has nowhere to send the form (or every destination failed): retrying will not help.
  if (['not_configured', 'delivery_failed'].includes(err.code)) {
    return { fields: {}, summary: t('errors.unavailable') };
  }
  const known = ['network', 'rate_limited'].includes(err.code) ? err.code : 'server_error';
  return { fields: {}, summary: t(`errors.${known}`) };
}

export const isPhone = (value) => {
  const digits = value.replace(/\D/g, '');
  return /^[+\d\s().-]+$/.test(value) && digits.length >= 8 && digits.length <= 15;
};

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
