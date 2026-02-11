// SwitchCustom.jsx
import React, { type FunctionComponent, useEffect, useState } from "react";
import { Switch, Typography } from "antd";
import "./FormSwitch.scss";

type SwitchProps = {
  value?: boolean;
  checked?: boolean;
  field?: string;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  customStyle?: React.CSSProperties;
  size?: "small" | "default";
  itemRecord?: any;
  defaultValue?: boolean;
};

const FormSwitch: FunctionComponent<SwitchProps> = ({
  value,
  checked = true,
  field = "checked",
  onChange,
  label,
  disabled = false,
  customStyle = {},
  size = "default",
  itemRecord,
  defaultValue,
  ...props
}) => {
  // Ưu tiên value trước, sau đó đến defaultValue, cuối cùng là checked
  const initialValue = value !== undefined ? value : (defaultValue !== undefined ? defaultValue : checked);
  const [checkedValue, setCheckValue] = useState(initialValue);

  const handleChange = (newChecked: boolean) => {
    setCheckValue(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  useEffect(() => {
    // Chỉ update state, không gọi onChange để tránh vòng lặp
    if (value !== undefined) {
      setCheckValue(value);
    } else if (defaultValue !== undefined) {
      setCheckValue(defaultValue);
    } else if (checked !== undefined) {
      setCheckValue(checked);
    }
  }, [value, defaultValue, checked]); // Theo dõi value, defaultValue và checked

  return (
    <div className="switch-custom">
      {label && <Typography.Text>{label}</Typography.Text>}
      <Switch
        checked={checkedValue}
        onChange={handleChange}
        disabled={disabled}
        style={customStyle}
        size={size}
        {...props}
      />
    </div>
  );
};

export default FormSwitch;