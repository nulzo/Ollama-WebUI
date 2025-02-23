import React, { createContext, useContext, useRef } from 'react';

export type FormSubmitHandler = () => Promise<void> | void;

interface SettingsFormsContextValue {
  registerForm: (id: string, onSubmit: FormSubmitHandler) => void;
  unregisterForm: (id: string) => void;
  submitForm: (id: string) => Promise<void>;
}

const SettingsFormsContext = createContext<SettingsFormsContextValue>({
  registerForm: () => {},
  unregisterForm: () => {},
  submitForm: async () => {},
});

export function useSettingsForms() {
  return useContext(SettingsFormsContext);
}

export const SettingsFormsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const formsRef = useRef<Record<string, FormSubmitHandler>>({});

  const registerForm = (id: string, onSubmit: FormSubmitHandler) => {
    formsRef.current[id] = onSubmit;
  };

  const unregisterForm = (id: string) => {
    delete formsRef.current[id];
  };

  const submitForm = async (id: string) => {
    if (formsRef.current[id]) {
      try {
        await formsRef.current[id]();
      } catch (error) {
        console.error(`Error submitting form ${id}:`, error);
      }
    }
  };

  return (
    <SettingsFormsContext.Provider value={{ registerForm, unregisterForm, submitForm }}>
      {children}
    </SettingsFormsContext.Provider>
  );
};