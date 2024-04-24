import React, { useState } from "react";

interface FormFieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange }) => (
  <div>
    <label>{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

interface FormProps {
  onSubmit: (values: any) => void;
}

const Form: React.FC<FormProps> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Name"
        value={name}
        onChange={(value) => setName(value)}
      />
      <FormField
        label="Email"
        value={email}
        onChange={(value) => setEmail(value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

// const App = () => {
//   const handleSubmit = (values: any) => {
//     console.log(values);
//   };

//   return (
//     <div>
//       <Form onSubmit={handleSubmit} />
//     </div>
//   );
// };
