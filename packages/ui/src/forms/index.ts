/**
 * Form Components
 *
 * Comprehensive form components with glass styling for zOS.
 *
 * @example
 * ```tsx
 * import {
 *   Form,
 *   TextField,
 *   TextArea,
 *   Select,
 *   Checkbox,
 *   RadioGroup,
 *   FormSwitch,
 *   FormSlider,
 *   DatePicker,
 *   ColorPicker,
 *   FileInput,
 *   FormField,
 *   FormActions,
 * } from '@z-os/ui/forms';
 *
 * function MyForm() {
 *   return (
 *     <Form
 *       initialValues={{ name: '', email: '' }}
 *       onSubmit={(values) => console.log(values)}
 *       validate={(values) => ({
 *         name: values.name ? undefined : 'Name is required',
 *       })}
 *     >
 *       {({ values, errors, handleChange }) => (
 *         <>
 *           <TextField
 *             value={values.name}
 *             onChange={(v) => handleChange('name', v)}
 *             error={errors.name}
 *             label="Name"
 *             required
 *           />
 *           <FormActions>
 *             <Button type="submit">Submit</Button>
 *           </FormActions>
 *         </>
 *       )}
 *     </Form>
 *   );
 * }
 * ```
 */

// Types
export type {
  FormSize,
  FormFieldBaseProps,
  TextInputBaseProps,
  SelectOption,
  ValidationRule,
  FieldState,
  FormState,
  FormContextValue,
} from './types';

export { SIZE_CLASSES, GLASS_STYLES } from './types';

// TextField
export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';

// TextArea
export { TextArea } from './TextArea';
export type { TextAreaProps } from './TextArea';

// Select
export { Select } from './Select';
export type { SelectProps } from './Select';

// Checkbox
export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

export { CheckboxGroup } from './CheckboxGroup';
export type { CheckboxGroupProps } from './CheckboxGroup';

// Radio
export { Radio } from './Radio';
export type { RadioProps } from './Radio';

export { RadioGroup } from './RadioGroup';
export type { RadioGroupProps, RadioOption } from './RadioGroup';

// Switch
export { FormSwitch } from './Switch';
export type { FormSwitchProps } from './Switch';

// Slider
export { FormSlider } from './Slider';
export type { FormSliderProps, SliderMark } from './Slider';

// DatePicker
export { DatePicker } from './DatePicker';
export type { DatePickerProps } from './DatePicker';

// ColorPicker
export { ColorPicker } from './ColorPicker';
export type { ColorPickerProps } from './ColorPicker';

// FileInput
export { FileInput } from './FileInput';
export type { FileInputProps } from './FileInput';

// FormField
export { FormField, FormFieldRow, FormSection, FormDivider } from './FormField';
export type {
  FormFieldProps,
  FormFieldRowProps,
  FormSectionProps,
  FormDividerProps,
} from './FormField';

// Form
export { Form, FormActions, useFormContext, useFormField } from './Form';
export type {
  FormProps,
  FormActionsProps,
  FormValues,
  FormErrors,
  FormTouched,
  ValidateFn,
  FormRenderProps,
} from './Form';
