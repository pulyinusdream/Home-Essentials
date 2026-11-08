"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export function DynamicTextList({
  name,
  label,
  addLabel,
  placeholder,
  initialValues,
}: {
  name: string;
  label: string;
  addLabel: string;
  placeholder: string;
  initialValues: string[];
}) {
  const [values, setValues] = useState(
    initialValues.length > 0 ? initialValues : [""],
  );

  return (
    <fieldset className="dynamic-fieldset">
      <legend>{label}</legend>
      <div className="dynamic-field-list">
        {values.map((value, index) => (
          <div className="dynamic-field-row" key={`${name}-${index}`}>
            <label className="sr-only" htmlFor={`${name}-${index}`}>
              {label} {index + 1}
            </label>
            <input
              id={`${name}-${index}`}
              name={name}
              value={value}
              placeholder={placeholder}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                setValues(next);
              }}
            />
            <button
              type="button"
              aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
              onClick={() =>
                setValues((current) =>
                  current.length === 1
                    ? [""]
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            >
              <X aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button
        className="add-dynamic-field"
        type="button"
        onClick={() => setValues((current) => [...current, ""])}
      >
        <Plus aria-hidden="true" />
        {addLabel}
      </button>
    </fieldset>
  );
}

export function DynamicSpecifications({
  initialValues,
}: {
  initialValues: Array<{ name: string; value: string }>;
}) {
  const [values, setValues] = useState(
    initialValues.length > 0 ? initialValues : [{ name: "", value: "" }],
  );

  return (
    <fieldset className="dynamic-fieldset">
      <legend>Custom specifications</legend>
      <div className="specification-list">
        {values.map((item, index) => (
          <div className="specification-row" key={`specification-${index}`}>
            <label>
              <span className="sr-only">Specification name {index + 1}</span>
              <input
                name="specificationName"
                value={item.name}
                placeholder="Material"
                onChange={(event) => {
                  const next = [...values];
                  next[index] = { ...item, name: event.target.value };
                  setValues(next);
                }}
              />
            </label>
            <label>
              <span className="sr-only">Specification value {index + 1}</span>
              <input
                name="specificationValue"
                value={item.value}
                placeholder="Bamboo"
                onChange={(event) => {
                  const next = [...values];
                  next[index] = { ...item, value: event.target.value };
                  setValues(next);
                }}
              />
            </label>
            <button
              type="button"
              aria-label={`Remove specification ${index + 1}`}
              onClick={() =>
                setValues((current) =>
                  current.length === 1
                    ? [{ name: "", value: "" }]
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            >
              <X aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button
        className="add-dynamic-field"
        type="button"
        onClick={() =>
          setValues((current) => [...current, { name: "", value: "" }])
        }
      >
        <Plus aria-hidden="true" />
        Add specification
      </button>
    </fieldset>
  );
}
