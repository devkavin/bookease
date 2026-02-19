import * as React from 'react';

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="mb-1 block text-sm text-white/80" {...props} />;
}
